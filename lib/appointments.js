const { ObjectId } = require("mongodb");
const { APPOINTMENT_DURATION_MINUTES, TIMEZONE, combineDateAndTimeInKolkata, formatDateLabel, formatTimeLabel } = require("./calendar");
const { isValidDateString } = require("./slots");

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function isValidTimeString(value) {
  return /^\d{2}:\d{2}$/.test(String(value || ""));
}

function buildAppointmentsQuery(start, end) {
  const query = {};

  if (start && end) {
    query.date = { $gte: start, $lt: end };
  } else if (start) {
    query.date = { $gte: start };
  } else if (end) {
    query.date = { $lt: end };
  }

  return query;
}

function toAppointmentEvent(appointment) {
  const startDate = combineDateAndTimeInKolkata(appointment.date, appointment.time);
  const endDate = addMinutes(startDate, APPOINTMENT_DURATION_MINUTES);

  return {
    id: appointment._id instanceof ObjectId ? appointment._id.toString() : String(appointment._id || `${appointment.email}-${appointment.date}-${appointment.time}`),
    title: `${appointment.service} · ${appointment.name}`,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    allDay: false,
    extendedProps: {
      patientName: appointment.name,
      email: appointment.email,
      phone: appointment.phone,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      dateLabel: formatDateLabel(appointment.date),
      timeLabel: `${formatTimeLabel(appointment.time)} IST`,
      message: appointment.message || "",
      timezone: TIMEZONE
    }
  };
}

function validateRangeParams(start, end) {
  if (start && !isValidDateString(start)) {
    return "Please provide a valid start date in YYYY-MM-DD format.";
  }

  if (end && !isValidDateString(end)) {
    return "Please provide a valid end date in YYYY-MM-DD format.";
  }

  return null;
}

module.exports = {
  APPOINTMENT_DURATION_MINUTES,
  TIMEZONE,
  isValidTimeString,
  validateRangeParams,
  buildAppointmentsQuery,
  toAppointmentEvent
};
