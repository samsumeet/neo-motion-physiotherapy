const crypto = require("crypto");

const CLINIC_NAME = "NeoMotion PhysioTherapy";
const CLINIC_ADDRESS = "Plot No - 13, Nyay Khand I, Indirapuram, Ghaziabad, Uttar Pradesh 201020, India";
const CLINIC_PHONE = "+91 98765 43210";
const CLINIC_EMAIL = "info@neomotion-physio.in";
const ORGANIZER_NAME = "Bablu Maurya";
const INVITEE_NAMES = ["Bablu Maurya", "Aakanskha Maurya"];
const TIMEZONE = "Asia/Kolkata";
const APPOINTMENT_DURATION_MINUTES = 45;

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatDateLabel(date) {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return formatter.format(new Date(`${date}T00:00:00+05:30`));
}

function formatTimeLabel(time) {
  const [hourText, minute] = String(time).split(":");
  const hour = Number(hourText);
  const suffix = hour >= 12 ? "PM" : "AM";
  const normalizedHour = hour % 12 || 12;
  return `${pad(normalizedHour)}:${minute} ${suffix}`;
}

function combineDateAndTimeInKolkata(date, time) {
  return new Date(`${date}T${time}:00+05:30`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function toUtcIcsString(date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function escapeIcsText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function escapeIcsParam(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/:/g, "\\:");
}

function createStableUid(booking) {
  const key = [booking.email, booking.date, booking.time, booking.service].join("|");
  return `${crypto.createHash("sha1").update(key).digest("hex")}@neomotion-physio.in`;
}

function buildEventSummary(service) {
  return `${service} - ${CLINIC_NAME}`;
}

function buildEventDescription(booking) {
  const lines = [
    `Patient: ${booking.name}`,
    `Service: ${booking.service}`,
    `Date: ${formatDateLabel(booking.date)}`,
    `Time: ${formatTimeLabel(booking.time)} IST`,
    `Clinic: ${CLINIC_NAME}`,
    `Address: ${CLINIC_ADDRESS}`,
    `Phone: ${CLINIC_PHONE}`,
    `Email: ${CLINIC_EMAIL}`,
    "Please arrive 10 minutes early."
  ];

  if (booking.message) {
    lines.push(`Notes: ${booking.message}`);
  }

  return lines.join("\n");
}

function generateIcsContent(booking) {
  const startDate = combineDateAndTimeInKolkata(booking.date, booking.time);
  const endDate = addMinutes(startDate, APPOINTMENT_DURATION_MINUTES);
  const now = new Date();
  const summary = buildEventSummary(booking.service);
  const description = buildEventDescription(booking);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NeoMotion PhysioTherapy//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${createStableUid(booking)}`,
    `DTSTAMP:${toUtcIcsString(now)}`,
    `DTSTART:${toUtcIcsString(startDate)}`,
    `DTEND:${toUtcIcsString(endDate)}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(CLINIC_ADDRESS)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `ORGANIZER;CN=${escapeIcsParam(ORGANIZER_NAME)}:MAILTO:${CLINIC_EMAIL}`,
    ...INVITEE_NAMES.map(
      (name) =>
        `ATTENDEE;CN=${escapeIcsParam(name)};CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:MAILTO:${CLINIC_EMAIL}`
    ),
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
}

function buildGoogleCalendarUrl(booking) {
  const startDate = combineDateAndTimeInKolkata(booking.date, booking.time);
  const endDate = addMinutes(startDate, APPOINTMENT_DURATION_MINUTES);
  const title = buildEventSummary(booking.service);
  const description = buildEventDescription(booking);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toUtcIcsString(startDate)}/${toUtcIcsString(endDate)}`,
    details: description,
    location: CLINIC_ADDRESS
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

module.exports = {
  CLINIC_NAME,
  CLINIC_ADDRESS,
  CLINIC_PHONE,
  CLINIC_EMAIL,
  ORGANIZER_NAME,
  INVITEE_NAMES,
  TIMEZONE,
  APPOINTMENT_DURATION_MINUTES,
  combineDateAndTimeInKolkata,
  toUtcIcsString,
  formatDateLabel,
  formatTimeLabel,
  generateIcsContent,
  buildGoogleCalendarUrl
};
