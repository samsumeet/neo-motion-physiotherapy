const TIMEZONE = "Asia/Kolkata";
const SLOT_INTERVAL_MINUTES = 45;
const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 21;

function pad(value) {
  return String(value).padStart(2, "0");
}

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function formatTimeLabel(time24) {
  const [hourText, minute] = String(time24).split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${pad(normalizedHour)}:${minute} ${suffix}`;
}

function getKolkataNowParts() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(new Date());
  const map = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  });

  return {
    date: `${map.year}-${map.month}-${map.day}`,
    time: `${map.hour}:${map.minute}`
  };
}

function isTodayInKolkata(date) {
  return getKolkataNowParts().date === date;
}

function generateDailySlots() {
  const slots = [];
  const startMinutes = WORKDAY_START_HOUR * 60;
  const endMinutes = WORKDAY_END_HOUR * 60;

  for (let minutes = startMinutes; minutes < endMinutes; minutes += SLOT_INTERVAL_MINUTES) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const value = `${pad(hour)}:${pad(minute)}`;
    slots.push({
      value,
      label: formatTimeLabel(value)
    });
  }

  return slots;
}

function filterPastSlotsForDate(slots, date) {
  if (!isTodayInKolkata(date)) {
    return slots;
  }

  const { time } = getKolkataNowParts();
  return slots.filter((slot) => slot.value > time);
}

function buildAvailableSlots(date, bookedTimes) {
  const booked = new Set((bookedTimes || []).map((time) => String(time).trim()));
  return filterPastSlotsForDate(generateDailySlots(), date).filter((slot) => !booked.has(slot.value));
}

module.exports = {
  TIMEZONE,
  SLOT_INTERVAL_MINUTES,
  WORKDAY_START_HOUR,
  WORKDAY_END_HOUR,
  isValidDateString,
  formatTimeLabel,
  getKolkataNowParts,
  isTodayInKolkata,
  generateDailySlots,
  filterPastSlotsForDate,
  buildAvailableSlots
};
