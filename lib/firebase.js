var admin = require("firebase-admin");
var serviceAccount = require("../hydrosync-firebase-adminsdk.json");
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
  let time = new Date().toISOString();
  try {
    const snapshot = await realTimeWaterRef.get();
    if (snapshot.empty) {
      console.log("No documents found in Water Quality.");
      return;
    }
    snapshot.forEach((doc) => {
      recordedData.push(doc.data());
    });
    let totalVolume = filterAndAccumulate("totalVolume", recordedData);
    let data = {
      totalVolume: totalVolume,
      time: formatTimestamps(time),
    };
    await totalWaterRef.doc(time).set(data);
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

    dataToSend = {
      ph: averagePH,
      turbidity: averageTurbidity,
      temperature: averageTemperature,
      timestamp: dateISO,
      formattedDate: formatTimestamps(dateISO),
    };

    console.log(
      "ph: ",
      averagePH,
      "turbidity: ",
      averageTurbidity,
      "temperature: ",
      averageTemperature
    );
    try {
      await sendAverageData(dataToSend);
    } catch (err) {
      console.error("Error sending averaged data to Firestore:", err);
    }
  } catch (error) {
    console.error("Error fetching documents from Firestore:", error);
  }
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

module.exports = {
  sendWaterQualityData,
  fetchAllDocsAndAverage,
  sendTotalWater,
  fetchAndTotalWater,
};
