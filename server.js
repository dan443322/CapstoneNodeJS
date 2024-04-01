//  v0: ph
//  v1: flow rate
//  v2: turbidity
//  v3: Water Level
//  v4: Total Volume
//  v5: Temperature
//  v9: Switch

const api = require("./api.service");

async function fetchData() {
  try {
    const response = await api.fetchAll();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

setInterval(fetchData, 5000);
