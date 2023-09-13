const timezoneMap = {
  bst: 1,
  est: -5,
  edt: -4,
  gmt: 0,
  pst: -8,
  pdt: -7,
  cet: 1,
  cest: 2,
};

const daysOfWeek = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function to24HourFormat(hour, dayTime) {
  if (dayTime === "pm" && hour !== 12) {
    hour += 12;
  } else if (dayTime === "am" && hour === 12) {
    hour = 0;
  }
  console.log(`hour to 24: ${hour}`);
  return { hour };
}

function from24HourFormat(hour) {
  let dayTime = "am";

  if (hour >= 12) {
    dayTime = "pm";
    if (hour > 12) {
      hour -= 12;
    }
  } else if (hour === 0) {
    hour = 12;
  }
  console.log(`hour from 24: ${hour}`);

  return { hour, dayTime };
}

async function toUTC(hour, day, timezone) {
  const offset = timezoneMap[timezone];

  hour -= offset;
  if (hour >= 24) {
    hour -= 24;
    day = daysOfWeek[(daysOfWeek.indexOf(day) + 1) % 7];
  } else if (hour < 0) {
    hour += 24;
    day = daysOfWeek[(daysOfWeek.indexOf(day) - 1 + 7) % 7];
  }
  console.log(`hour to UTC: ${hour}`);

  return { hour, day };
}

async function fromUTC(hour, day, timezone) {
  const offset = timezoneMap[timezone];

  hour += offset;
  if (hour >= 24) {
    hour -= 24;
    day = daysOfWeek[(daysOfWeek.indexOf(day) + 1) % 7];
  } else if (hour < 0) {
    hour += 24;
    day = daysOfWeek[(daysOfWeek.indexOf(day) - 1 + 7) % 7];
  }
  console.log(`hour from UTC: ${hour}`);

  return { hour, day };
}

module.exports = { to24HourFormat, from24HourFormat, toUTC, fromUTC };
