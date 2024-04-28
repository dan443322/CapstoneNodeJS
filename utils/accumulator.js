const filterAndAccumulate = (keyName, docs) => {
  const values = [];
  const filteredValues = [];
  let prevValue = 0;
  let totalVolume = 0;

  docs.forEach((doc) => {
    let keyValue = doc[keyName];
    values.push(keyValue);
  });

  values.forEach((value, index) => {
    if (index === 0) {
      filteredValues.push(prevValue);
      prevValue = value;
    } else {
      if (prevValue <= value) {
        prevValue = value;
      } else {
        filteredValues.push(prevValue);
        prevValue = value;
      }
    }
  });

  if (prevValue !== 0) {
    filteredValues.push(prevValue);
  }

  totalVolume = filteredValues.reduce((a, b) => a + b, 0);
  return totalVolume.toFixed(2);
};

module.exports = filterAndAccumulate;
