const { getDatabase } = require("../lib/mongodb");
const { isValidDateString } = require("../lib/slots");
const { sendBookingConfirmationEmail } = require("../lib/email");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getPhoneDigits(value = "") {
  return String(value).replace(/\D/g, "");
}

function normalizeBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function validateBooking(data) {
  const requiredFields = ["name", "email", "phone", "service", "date", "time"];

  for (const field of requiredFields) {
    if (!String(data[field] || "").trim()) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
    }
  }

  if (!emailPattern.test(String(data.email).trim())) {
    return "Please enter a valid email address.";
  }

  if (getPhoneDigits(data.phone).length < 7) {
    return "Please enter a valid phone number.";
  }

  if (!isValidDateString(String(data.date).trim())) {
    return "Please provide a valid date in YYYY-MM-DD format.";
  }

  if (!/^\d{2}:\d{2}$/.test(String(data.time).trim())) {
    return "Please provide a valid time in HH:mm format.";
  }

  return null;
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ success: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  try {
    const payload = normalizeBody(req.body);
    const validationError = validateBooking(payload);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const booking = {
      name: String(payload.name).trim(),
      email: String(payload.email).trim().toLowerCase(),
      phone: String(payload.phone).trim(),
      service: String(payload.service).trim(),
      date: String(payload.date).trim(),
      time: String(payload.time).trim(),
      message: String(payload.message || "").trim(),
      createdAt: new Date()
    };

    const db = await getDatabase();
    const appointments = db.collection("appointments");

    await appointments.createIndex(
      { email: 1, date: 1, time: 1 },
      { unique: true, name: "unique_contact_slot" }
    );
    await appointments.createIndex(
      { date: 1, time: 1 },
      { unique: true, name: "unique_time_slot" }
    );

    const duplicateContactBooking = await appointments.findOne({
      email: booking.email,
      date: booking.date,
      time: booking.time
    });

    if (duplicateContactBooking) {
      return res.status(409).json({
        success: false,
        message: "This slot is already booked for this contact. Please choose another time."
      });
    }

    const slotTaken = await appointments.findOne({
      date: booking.date,
      time: booking.time
    });

    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: "This time slot was just booked. Please choose another available time."
      });
    }

    await appointments.insertOne(booking);

    let emailSent = false;
    try {
      emailSent = await sendBookingConfirmationEmail(booking);
    } catch (emailError) {
      console.error("Booking email error:", emailError);
    }

    return res.status(200).json({
      success: true,
      message: "✓ Booking request received. We will confirm via email or phone.",
      emailSent
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This time slot was just booked. Please choose another available time."
      });
    }

    console.error("Booking API error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while saving your booking. Please try again."
    });
  }
};
