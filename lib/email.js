const nodemailer = require("nodemailer");
const {
  CLINIC_NAME,
  CLINIC_ADDRESS,
  CLINIC_PHONE,
  CLINIC_EMAIL,
  formatDateLabel,
  formatTimeLabel,
  generateIcsContent,
  buildGoogleCalendarUrl
} = require("./calendar");

function getSmtpConfig() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    return null;
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    },
    from: SMTP_FROM
  };
}

async function sendBookingConfirmationEmail(booking) {
  const smtpConfig = getSmtpConfig();

  if (!smtpConfig) {
    console.warn("SMTP not configured. Skipping booking confirmation email.");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: smtpConfig.auth
  });

  const googleCalendarUrl = buildGoogleCalendarUrl(booking);
  const icsContent = generateIcsContent(booking);
  const subject = `Appointment Confirmed - ${CLINIC_NAME}`;
  const formattedDate = formatDateLabel(booking.date);
  const formattedTime = `${formatTimeLabel(booking.time)} IST`;
  const text = [
    `Hello ${booking.name},`,
    "",
    `Your appointment at ${CLINIC_NAME} has been confirmed.`,
    "",
    `Service: ${booking.service}`,
    `Date: ${formattedDate}`,
    `Time: ${formattedTime}`,
    `Clinic: ${CLINIC_NAME}`,
    `Address: ${CLINIC_ADDRESS}`,
    `Phone: ${CLINIC_PHONE}`,
    `Email: ${CLINIC_EMAIL}`,
    "",
    "Please arrive 10 minutes early.",
    "",
    `Add to Google Calendar: ${googleCalendarUrl}`
  ].join("\n");

  const html = `
    <p>Hello ${booking.name},</p>
    <p>Your appointment at <strong>${CLINIC_NAME}</strong> has been confirmed.</p>
    <p>
      <strong>Service:</strong> ${booking.service}<br>
      <strong>Date:</strong> ${formattedDate}<br>
      <strong>Time:</strong> ${formattedTime}<br>
      <strong>Clinic:</strong> ${CLINIC_NAME}<br>
      <strong>Address:</strong> ${CLINIC_ADDRESS}<br>
      <strong>Phone:</strong> ${CLINIC_PHONE}<br>
      <strong>Email:</strong> ${CLINIC_EMAIL}
    </p>
    <p><strong>Please arrive 10 minutes early.</strong></p>
    <p><a href="${googleCalendarUrl}">Add this appointment to Google Calendar</a></p>
  `;

  await transporter.sendMail({
    from: smtpConfig.from,
    to: booking.email,
    subject,
    text,
    html,
    attachments: [
      {
        filename: "neomotion-appointment.ics",
        content: icsContent,
        contentType: "text/calendar; charset=utf-8; method=PUBLISH"
      }
    ]
  });

  return true;
}

module.exports = {
  sendBookingConfirmationEmail
};
