const { getDatabase } = require("../lib/mongodb");
const { TIMEZONE, buildAvailableSlots, isValidDateString } = require("../lib/slots");

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(200).json({ success: true });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed." });
  }

  const date = String((req.query && req.query.date) || "").trim();

  if (!isValidDateString(date)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid date in YYYY-MM-DD format."
    });
  }

  try {
    const db = await getDatabase();
    const appointments = db.collection("appointments");
    const existingBookings = await appointments.find({ date }, { projection: { _id: 0, time: 1 } }).toArray();
    const slots = buildAvailableSlots(date, existingBookings.map((item) => item.time));

    return res.status(200).json({
      success: true,
      date,
      timezone: TIMEZONE,
      slots
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load availability right now. Please try again."
    });
  }
};
