// Visit https://github.com/dan443322/CapstoneNodeJS.git for a more structured version of this code
// including the more detailed folder structure

require("dotenv").config();
const api = require("./api.service");
const {
  sendWaterQualityData,
  fetchAllDocsAndAverage,
  sendRealTimeWater,
  fetchAndTotalWater,
} = require("./lib/firebase");

// v0: ph
// v1: flow rate
// v2: turbidity
// v3: water level
// v4: total volume
// v5: Temperature
// v6: isAutoSwitch
// v7: TotalVolumeResetPin
// v9: Solenoid Valve State

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
    await sendRealTimeWater({ waterValue: blynkResponse.v4 }, time);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

let blynkIntervalId;

const runServer = () => {
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

setTimeout(() => {
  console.log("Server running");
  runServer();
  setInterval(() => {
    fetchAllDocsAndAverage();
    fetchAndTotalWater();
  }, 60 * 60 * 1000);
}, 2000);
