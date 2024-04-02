// Import the functions you need from the SDKs you need
var admin = require("firebase-admin");

var serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://capstone-ffb9d-default-rtdb.asia-southeast1.firebasedatabase.app",
});
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const db = admin.firestore();

let testUser = db.collection("sSHMEXk1Jv-4tmmlc3xS37ANZqtRgx_t");

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyCSPNk3g0Ri_bpCHlf3mXy5j-Bg8ReeUjA",
//   authDomain: "capstone-ffb9d.firebaseapp.com",
//   databaseURL:
//     "https://capstone-ffb9d-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "capstone-ffb9d",
//   storageBucket: "capstone-ffb9d.appspot.com",
//   messagingSenderId: "248293716228",
//   appId: "1:248293716228:web:810ba37d3ad508122fe051",
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);

// module.exports = app;
