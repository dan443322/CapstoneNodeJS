const calculateAverage = (keyName, docs) => {
  let sum = 0;
  let count = 0;

  docs.forEach((doc) => {
    if (doc.hasOwnProperty(keyName)) {
      sum += doc[keyName];
      count++;
    }
  });

  let average = sum / count;

  return average.toFixed(2);
};

module.exports = calculateAverage;
