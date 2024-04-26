// const { initializeApp } = require("firebase/app");
const { collection, addDoc } = require("firebase/firestore");

var admin = require("firebase-admin");

var serviceAccount = require("../capstone-project-97f09-firebase-adminsdk-wx2bv-534313045c.json");
const convertFirestoreTimestamp = require("../timestampConvert");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://capstone-project-97f09-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.firestore();

let hydrosyncRef = db.collection("waterQuality");

const sendWaterQualityData = async (data) => {
  let time = new Date().toISOString();
  try {
    data = {
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    };
    await hydrosyncRef.doc(time).set(data);
    console.log("Data uploaded successfully");
  } catch (error) {
    console.error("Error sending data to Firestore:", error);
  }
};

const fetchKeyFromCollection = async (key) => {
  const values = [];

  try {
    // Query the collection
    const snapshot = await hydrosyncRef.get();

    // Iterate over each document
    snapshot.forEach((doc) => {
      // Check if the document has the specified key
      if (doc.exists && doc.data().hasOwnProperty(key)) {
        // Extract the value of the specified key from the document
        const value = doc.data()[key];
        values.push(value);
      }
    });
  } catch (error) {
    console.error("Error fetching key from collection:", error);
  }
  console.log(values);
  return values;
};

const fetchTimeStampFromCollection = async () => {
  const values = [];

  try {
    // Query the collection
    const snapshot = await hydrosyncRef.get();

    // Iterate over each document
    snapshot.forEach((doc) => {
      // Check if the document has the specified key
      if (doc.exists && doc.data().hasOwnProperty("timestamp")) {
        // Extract the value of the specified key from the document
        const value = doc.data()["timestamp"];

        values.push(convertFirestoreTimestamp(value));
      }
    });
  } catch (error) {
    console.error("Error fetching key from collection:", error);
  }
  console.log(values);
  return values;
};

// const fetchDocumentNames = async () => {
//   const documentNamesArray = [];
//   try {
//     // Query the collection
//     const snapshot = await hydrosyncRef.get();

//     // Extract document names (IDs) and append them to the provided array
//     snapshot.forEach((doc) => {
//       documentNamesArray.push(doc);
//     });

//     // No need to return anything since the array is modified in place
//   } catch (error) {
//     console.error("Error fetching document names:", error);
//     // Handle errors if needed
//   }
//   console.log(documentNamesArray);
//   return documentNamesArray;
// };

// Example usage:

// Create an empty array

// Call the function to fetch document names within a collection and append them to the array

module.exports = {
  sendWaterQualityData,
  fetchKeyFromCollection,
  fetchTimeStampFromCollection,
  // fetchDocumentNames,
};
// const {
//   getFirestore,
//   collection,
//   doc,
//   setDoc,
//   getDoc,
//   addDoc,
// } = require("firebase/firestore");

// const {
//   FIREBASE_API_KEY,
//   FIREBASE_AUTH_DOMAIN,
//   FIREBASE_DATABASE_URL,
//   FIREBASE_PROJECT_ID,
//   FIREBASE_STORAGE_BUCKET,
//   FIREBASE_MESSAGING_SENDER_ID,
//   FIREBASE_APP_ID,
// } = process.env;

// const firebaseConfig = {
//   apiKey: FIREBASE_API_KEY,
//   authDomain: FIREBASE_AUTH_DOMAIN,
//   databaseURL: FIREBASE_DATABASE_URL,
//   projectId: FIREBASE_PROJECT_ID,
//   storageBucket: FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
//   appId: FIREBASE_APP_ID,
// };

// let app;
// let firestoreDb;

// const initializeFirebaseApp = () => {
//   try {
//     app = initializeApp(firebaseConfig);
//     firestoreDb = getFirestore();
//     return app;
//   } catch (err) {
//     console.log("Error initializing Firebase app:", err);
//   }
// };

// const uploadProcessedData = async () => {
//   const dataToUpload = {
//     key1: "test",
//     key2: 123,
//     key3: true,
//     // key4: Timestamp.fromDate(new Date()),
//   };
//   try {
//     const document = doc(firestoreDb, "testCollection", "testingData");
//     let dataUpdated = await setDoc(document, dataToUpload);
//     console.log("Document written with ID: ", dataUpdated.id);
//     return dataUpdated;
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// };

// const getFirebaseApp = () => app;

// module.exports = { initializeFirebaseApp, getFirebaseApp, uploadProcessedData };
