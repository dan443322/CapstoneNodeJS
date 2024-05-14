var admin = require("firebase-admin");
var serviceAccount = require("../hydrosync-firebase-adminsdk.json");
const filterAndAccumulate = require("../utils/accumulator");
const calculateAverage = require("../utils/averageCalculator");
const formatTimestamps = require("../timestampConvert");
const { resetTotalVolume } = require("../api.service");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIRESTORE_DATABASE_URL,
});

const db = admin.firestore();

const oneHourQualityDataRef = db.collection("oneHourQualityData");
const averageRef = db.collection("averagedQualityData");
const realTimeWaterRef = db.collection("realTimeWater");
const totalWaterRef = db.collection("totalWater").doc("total");

const sendWaterQualityData = async (data, time) => {
  try {
    data = {
      ...data,
      timestamp: time,
    };
    await oneHourQualityDataRef.doc(time).set(data);
    console.log("Data uploaded successfully");
  } catch (error) {
    console.error("Error sending data to Firestore:", error);
    throw error;
  }
};

const sendRealTimeWater = async (data, time) => {
  data = {
    ...data,
    timestamp: time,
  };
  try {
    await realTimeWaterRef.doc(time).set(data);
    console.log("Total Water uploaded successfully");
  } catch (error) {
    console.error("Error sending total water to Firestore:", error);
    throw error;
  }
};

const sendAverageData = async (time, data) => {
  try {
    await averageRef.doc(time).set(data);
    console.log("Averaged Data uploaded successfully");
    deleteOneHourQuality();
  } catch (error) {
    console.error("Error sending averaged Data to Firestore:", error);
    throw error;
  }
};

const fetchAndTotalWater = async () => {
  let recordedData = [];
  let prevTotal;
  let oneHourTotal;
  let time = new Date().toISOString();

  await resetTotalVolume();

  await totalWaterRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const totalVolume = doc.data().totalVolume;
        prevTotal = totalVolume;
        console.log("fetched Total Volume: ", prevTotal);
      } else {
        console.log("No  document in totalWwaterRef");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  try {
    const snapshot = await realTimeWaterRef.get();
    if (snapshot.empty) {
      console.log("No documents found in realTimeWaterRef.");
      return;
    }
    snapshot.forEach((doc) => {
      let docData = doc.data();
      recordedData.push(docData);
    });

    oneHourTotal = filterAndAccumulate("waterValue", recordedData);
    let data = {
      totalVolume: Number(prevTotal) + Number(oneHourTotal),
      time: formatTimestamps(time),
    };
    try {
      await totalWaterRef.set(data);
      await deleteOneHourTotal();
    } catch (err) {
      console.log("Error sending total water to Firestore:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error fetching total water from Firestore:", error);
    throw error;
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
    const snapshot = await oneHourQualityDataRef.get();
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
      await sendAverageData(dateISO, dataToSend);
    } catch (err) {
      console.error("Error sending averaged data to Firestore:", err);
      throw err;
    }
  } catch (error) {
    console.error("Error fetching documents from Firestore:", error);
    throw error;
  }
};

const deleteOneHourQuality = async () => {
  try {
    const snapshot = await oneHourQualityDataRef.get();
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
    console.log("One Hour Quality Collection deleted");
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};

const deleteOneHourTotal = async () => {
  try {
    const snapshot = await realTimeWaterRef.get();
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
    console.log("One Hour Total Collection deleted");
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw error;
  }
};

module.exports = {
  sendWaterQualityData,
  fetchAllDocsAndAverage,
  sendRealTimeWater,
  fetchAndTotalWater,
};
