const axios = require("axios");

const statusUrl = "https://sgp1.blynk.cloud/external/api/isHardwareConnected";
const getAllUrl = "https://sgp1.blynk.cloud/external/api/getAll";
const token = process.env.BLYNK_API_KEY;

const resetTotalVolume = async () => {
  try {
    await axios.get("https://sgp1.blynk.cloud/external/api/update", {
      params: {
        token: token,
        pin: "V7",
        value: 0,
      },
    });
    console.log("Total Water Value Reset Successfully");
  } catch (err) {
    console.log("Error resetting Total Value:", err);
  }
};

const fetchAll = async () => {
  console.log("Fetching all Data...");
  try {
    const response = await axios.get(getAllUrl, {
      params: {
        token: token,
      },
    });
    // console.log(response.data);
    return await response.data;
  } catch (err) {
    console.log("error fetching All Data:", err);
  }
};

const fetchStatus = async () => {
  console.log("Fetching device status...");
  try {
    const response = await axios.get(statusUrl, {
      params: {
        token: token,
      },
    });
    console.log("device online:", response.data);
    return await response.data;
  } catch (err) {
    console.log("error fetching status:", err);
  }
};

module.exports = { fetchAll, fetchStatus, resetTotalVolume };
