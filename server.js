const api = require("./api.service");
const { sendWaterQualityData } = require("./lib/firebase");

//  v0: ph
//  v1: flow rate
//  v2: turbidity
//  v3: Water Level
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

let blynkIntervalId;

const runServer = async () => {
  setInterval(async () => {
    const status = await api.fetchStatus();
    if (status) {
      if (!blynkIntervalId) {
        blynkIntervalId = setInterval(blynkToFireStore, 5000);
      }
    } else {
      if (blynkIntervalId) {
        clearInterval(blynkIntervalId);
        blynkIntervalId = null;
      }
    }
  }, 10000);
};

runServer();

// const {
//   uploadProcessedData,
//   initializeFirebaseApp,
// } = require("./lib/firebase");

// initializeFirebaseApp();

// phRef.get().then((doc) => {
//   if (doc.exists) {
//     console.log("Document data:", doc.data());
//   } else {
//     console.log("No such document!");
//   }
// });

// phRef
//   .set({
//     ph: 0.5,
//     time: new Date(),
//   })
//   .then((doc) => {
//     console.log("Document written with ID: ", doc.id);
//   });

// const firestoreTest = async () => {
//   try {
//     await uploadProcessedData();
//     return "Data uploaded successfully";
//   } catch (error) {
//     console.error("Error sending data to Firestore:", error);
//   }
// };

// firestoreTest();

// setInterval(fetchData, 5000);
