// const { initializeApp } = require("firebase/app");
// const { collection, addDoc } = require("firebase/firestore");

var admin = require("firebase-admin");

var serviceAccount = require("../capstone-project-97f09-firebase-adminsdk-wx2bv-534313045c.json");
const convertFirestoreTimestamp = require("../timestampConvert");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://capstone-project-97f09-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.firestore();

let hydrosyncRef = db.collection("waterQuality");

const sendWaterQualityData = async (data) => {
  let time = new Date().toISOString();
  try {
    data = {
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await hydrosyncRef.doc(time).set(data);
    console.log("Data uploaded successfully");
  } catch (error) {
    console.error("Error sending data to Firestore:", error);
  }
};

const fetchKeyFromCollection = async (key) => {
  const values = [];

  try {
    // Query the collection
    const snapshot = await hydrosyncRef.get();

    // Iterate over each document
    snapshot.forEach((doc) => {
      // Check if the document has the specified key
      if (doc.exists && doc.data().hasOwnProperty(key)) {
        // Extract the value of the specified key from the document
        const value = doc.data()[key];
        values.push(value);
      }
    });
  } catch (error) {
    console.error("Error fetching key from collection:", error);
  }
  console.log(values);
  return values;
};

const fetchTimeStampFromCollection = async () => {
  const values = [];

  try {
    // Query the collection
    const snapshot = await hydrosyncRef.get();

    // Iterate over each document
    snapshot.forEach((doc) => {
      // Check if the document has the specified key
      if (doc.exists && doc.data().hasOwnProperty("timestamp")) {
        // Extract the value of the specified key from the document
        const value = doc.data()["timestamp"];

        values.push(convertFirestoreTimestamp(value));
      }
    });
  } catch (error) {
    console.error("Error fetching key from collection:", error);
  }
  console.log(values);
  return values;
};

const fetchTotalWaterFromCollection = async () => {
  const key = "totalVolume";
  const WaterValues = [];
  const filteredValues = [];
  let totalVolume;
  let prevValue = 0;

  try {
    const snapshot = await hydrosyncRef.get();

    // Iterate over each document
    snapshot.forEach((doc) => {
      // Check if the document has the specified key
      if (doc.exists && doc.data().hasOwnProperty(key)) {
        // Extract the value of the specified key from the document
        const value = doc.data()[key];
        WaterValues.push(value);
      }
    });
  } catch (error) {
    console.error("Error fetching key from collection:", error);
  }

  WaterValues.forEach((value, index) => {
    if (index === 0) {
      filteredValues.push(prevValue);
      prevValue = value;
    } else {
      if (prevValue <= value) {
        prevValue = value;
      } else {
        filteredValues.push(prevValue);
        prevValue = 0;
      }
    }
  });

  if (prevValue !== 0) {
    filteredValues.push(prevValue);
  }

  totalVolume = filteredValues.reduce((a, b) => a + b, 0);

  console.log("recorded Values: {", WaterValues, "}");
  console.log("filtered Values: {", filteredValues, "}");
  console.log("Total Volume: ", totalVolume);
  return { WaterValues, filteredValues, totalVolume };
};

module.exports = {
  sendWaterQualityData,
  fetchKeyFromCollection,
  fetchTimeStampFromCollection,
  fetchTotalWaterFromCollection,
};
