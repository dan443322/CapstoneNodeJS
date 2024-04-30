// const { initializeApp } = require("firebase/app");
// const { collection, addDoc } = require("firebase/firestore");

var admin = require("firebase-admin");

var serviceAccount = require("../hydrosync-firebase-adminsdk.json");
const convertFirestoreTimestamp = require("../timestampConvert");
const filterAndAccumulate = require("../utils/accumulator");
const calculateAverage = require("../utils/averageCalculator");
const formatTimestamps = require("../timestampConvert");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRESTORE_DATABASE_URL,
});

const db = admin.firestore();

const hydrosyncRef = db.collection("oneHourQualityData");
const averageRef = db.collection("averagedQualityData");
const realTimeWaterRef = db.collection("realTimeWater");
const totalWaterRef = db.collection("totalWater");

const sendWaterQualityData = async (data, time) => {
  try {
    data = {
      ...data,
      timestamp: time,
    };
    await hydrosyncRef.doc(time).set(data);
    console.log("Data uploaded successfully");
  } catch (error) {
    console.error("Error sending data to Firestore:", error);
  }
};

const sendTotalWater = async (data, time) => {
  data = {
    ...data,
    timestamp: time,
  };
  try {
    await realTimeWaterRef.doc(time).set(data);
    console.log("Total Water uploaded successfully");
  } catch (error) {
    console.error("Error sending total water to Firestore:", error);
  }
};

const sendAverageData = async (data) => {
  try {
    await averageRef.doc(time).set(data);
    console.log("Averaged Data uploaded successfully");
    deleteCollection();
  } catch (error) {
    console.error("Error sending averaged Data to Firestore:", error);
  }
};

const fetchAndTotalWater = async () => {
  let recordedData = [];
  let totalVolume;
  try {
    const snapshot = await totalWaterRef.get();
    if (snapshot.empty) {
      console.log("No documents found in Water Quality.");
      return;
    }
    snapshot.forEach((doc) => {
      recordedData.push(doc.data());
    });
    totalVolume = filterAndAccumulate("totalVolume", recordedData);
  } catch (error) {
    console.error("Error fetching total water from Firestore:", error);
  }
};

// for fetching water quality data and averaging it
const fetchAllDocsAndAverage = async () => {
  let docs = [];
  let averagePH;
  let averageTurbidity;
  let averageTemperature;
  // let totalVolume;
  let dataToSend;
  let dateISO = new Date().toISOString();
  try {
    const snapshot = await hydrosyncRef.get();
    if (snapshot.empty) {
      console.log("No documents found in Water Quality.");
      return;
    }
    snapshot.forEach((doc) => {
      docs.push(doc.data());
    });

    averagePH = calculateAverage("ph", docs);
    averageTurbidity = calculateAverage("turbidity", docs);
    averageTemperature = calculateAverage("temperature", docs);
    // totalVolume = filterAndAccumulate("totalVolume", docs);

    dataToSend = {
      ph: averagePH,
      turbidity: averageTurbidity,
      temperature: averageTemperature,
      timestamp: dateISO,
      formattedDate: formatTimestamps(dateISO),
    };
    // waterArrayRef.update({
    //   waterValues: admin.firestore.FieldValue.arrayUnion(...totalVolume),
    // });
    await sendAverageData(dataToSend);
  } catch (error) {
    console.error("Error fetching documents from Firestore:", error);
  }
  // console.log(docs);

  console.log(
    "ph: ",
    averagePH,
    "turbidity: ",
    averageTurbidity,
    "temperature: ",
    averageTemperature,
    "totalVolume: ",
    totalVolume
  );
};

const deleteCollection = async () => {
  try {
    const snapshot = await hydrosyncRef.get();
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
    console.log("Collection deleted");
  } catch (error) {
    console.error("Error deleting collection:", error);
  }
};

// const fetchTotalWaterFromCollection = async () => {
//   const key = "totalVolume";
//   const WaterValues = [];
//   const filteredValues = [];
//   let totalVolume;
//   let prevValue = 0;

//   try {
//     const snapshot = await hydrosyncRef.get();

//     // Iterate over each document
//     snapshot.forEach((doc) => {
//       // Check if the document has the specified key
//       if (doc.exists && doc.data().hasOwnProperty(key)) {
//         // Extract the value of the specified key from the document
//         const value = doc.data()[key];
//         WaterValues.push(value);
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching key from collection:", error);
//   }

//   WaterValues.forEach((value, index) => {
//     if (index === 0) {
//       filteredValues.push(prevValue);
//       prevValue = value;
//     } else {
//       if (prevValue <= value) {
//         prevValue = value;
//       } else {
//         filteredValues.push(prevValue);
//         prevValue = 0;
//       }
//     }
//   });

//   if (prevValue !== 0) {
//     filteredValues.push(prevValue);
//   }

//   totalVolume = filteredValues.reduce((a, b) => a + b, 0);

//   console.log("recorded Values: {", WaterValues, "}");
//   console.log("filtered Values: {", filteredValues, "}");
//   console.log("Total Volume: ", totalVolume);
//   return { WaterValues, filteredValues, totalVolume };
// };

module.exports = {
  sendWaterQualityData,
  fetchAllDocsAndAverage,
  sendTotalWater,
  fetchAndTotalWater,
  // fetchKeyFromCollection,
  // fetchTimeStampFromCollection,
  // fetchTotalWaterFromCollection,
};
