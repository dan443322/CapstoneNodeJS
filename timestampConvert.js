function convertFirestoreTimestamp(timestamp) {
  // Convert Firestore timestamp to milliseconds
  const milliseconds =
    timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;

  // Create a new Date object
  const date = new Date(milliseconds);

  // Adjust the date by the timezone offset if necessary
  // const offset = date.getTimezoneOffset() * 60000; // Convert minutes to milliseconds
  // const adjustedDate = new Date(date.getTime() + offset);

  // Extract the components of the adjusted date
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Adding 1 because getMonth() returns zero-based month
  const day = ("0" + date.getDate()).slice(-2);
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);

  // Format the date as a string
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

module.exports = convertFirestoreTimestamp;
