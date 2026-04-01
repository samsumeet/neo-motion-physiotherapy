const { getDatabase } = require("../lib/mongodb");
const { buildAppointmentsQuery, toAppointmentEvent, validateRangeParams, TIMEZONE } = require("../lib/appointments");

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

  const start = String((req.query && req.query.start) || "").trim();
  const end = String((req.query && req.query.end) || "").trim();
  const validationError = validateRangeParams(start, end);

  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }

  try {
    const db = await getDatabase();
    const appointments = db.collection("appointments");
    const query = buildAppointmentsQuery(start, end);
    const items = await appointments
      .find(query)
      .sort({ date: 1, time: 1, createdAt: 1 })
      .toArray();

    return res.status(200).json({
      success: true,
      timezone: TIMEZONE,
      appointments: items.map(toAppointmentEvent)
    });
  } catch (error) {
    console.error("Appointments API error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load appointments right now. Please try again."
    });
  }
};
