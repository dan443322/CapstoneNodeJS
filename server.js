const api = require("./api.service");
const {
  sendWaterQualityData,
  fetchAllDocsAndAverage,
} = require("./lib/firebase");

let blynkIntervalId;

//  v0: ph
//  v1: flow rate
//  v2: turbidity
//  v4: Total Volume
//  v5: Temperature
//  v9: Switch

const blynkToFireStore = async () => {
  try {
    const blynkResponse = await api.fetchAll();
    await sendWaterQualityData({
      ph: blynkResponse.v0,
      turbidity: blynkResponse.v2,
      totalVolume: blynkResponse.v4,
      temperature: blynkResponse.v5,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const runServer = async () => {
  setInterval(async () => {
    const status = await api.fetchStatus();
    if (status) {
      if (!blynkIntervalId) {
        blynkIntervalId = setInterval(blynkToFireStore, 60 * 1000);
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
fetchAllDocsAndAverage();

setTimeout(() => {
  runServer();
}, 2000);

setInterval(fetchAllDocsAndAverage, 60 * 60 * 1000);
