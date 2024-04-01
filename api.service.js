const axios = require("axios");

const statusUrl = "https://sgp1.blynk.cloud/external/api/isHardwareConnected";
const getAllUrl = "https://sgp1.blynk.cloud/external/api/getAll";
const token = "sSHMEXk1Jv-4tmmlc3xS37ANZqtRgx_t";

const fetchAll = async () => {
  const response = await axios.get(getAllUrl, {
    params: {
      token: token,
    },
  });
  console.log(response.data);
  return await response.data;
};

const fetchStatus = async () => {
  const response = await axios.get(statusUrl, {
    params: {
      token: token,
    },
  });
  console.log(response.data);
  return await response.data;
};

const sendToDatabase = async () => {
  fetchAll();
};

module.exports = { fetchAll, fetchStatus };
