require("dotenv").config();
const api = require("./api.service");
const {
  sendWaterQualityData,
  fetchAllDocsAndAverage,
  sendTotalWater,
  fetchAndTotalWater,
} = require("./lib/firebase");

let blynkIntervalId;

//  v0: ph
//  v1: flow rate
//  v2: turbidity
//  v4: Total Volume
//  v5: Temperature
//  v9: Switch

const blynkToFireStore = async () => {
  let time = new Date().toISOString();
  try {
    const blynkResponse = await api.fetchAll();
    await sendWaterQualityData(
      {
        ph: blynkResponse.v0,
        turbidity: blynkResponse.v2,
        temperature: blynkResponse.v5,
      },
      time
    );
    await sendTotalWater(blynkResponse.v4, time);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const runServer = () => {
  setInterval(async () => {
    const status = await api.fetchStatus();
    if (!status) {
      if (!blynkIntervalId) {
        blynkIntervalId = setInterval(blynkToFireStore, 6 * 1000);
      }
    } else {
      if (blynkIntervalId) {
        clearInterval(blynkIntervalId);
        blynkIntervalId = null;
      }
    }
  }, 10000);
};
console.log("Starting server...");
// fetchAllDocsAndAverage();

setTimeout(() => {
  runServer();
  setInterval(() => {
    fetchAllDocsAndAverage();
    fetchAndTotalWater();
  }, 60 * 60 * 1000);
}, 2000);

// setInterval(fetchAllDocsAndAverage, 60 * 60 * 1000);
