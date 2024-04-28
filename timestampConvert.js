function padZero(num) {
  return num < 10 ? "0" + num : num;
}

const formattedHour = (hour) => {
  if (hour == 0 || hour == 12) {
    return 12;
  } else if (hour < 12) {
    return hour;
  } else {
    return hour - 12;
  }
};

function formatTimestamps(timestamp) {
  let formattedDate;

  const date = new Date(timestamp);

  const month = date.toLocaleString("default", { month: "short" }); // Get month abbreviation
  const day = date.getDate(); // Get day of the month
  const hour = date.getHours(); // Get hour of the day
  const amOrPm = hour >= 12 ? "PM" : "AM"; // Determine if it's AM or PM
  const format12Hour = formattedHour(hour);
  formattedDate = `${month} ${padZero(day)}, ${format12Hour} ${amOrPm}`;

  console.log(formattedDate);
  return formattedDate;
}

module.exports = formatTimestamps;
