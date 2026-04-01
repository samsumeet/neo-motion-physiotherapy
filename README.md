# NeoMotion PhysioTherapy Website

This project is the clinic website for NeoMotion PhysioTherapy, with a static root `index.html` and Vercel serverless APIs for booking, availability, and email confirmation.

## Main Files

- `index.html`
- `api/book.js`
- `api/availability.js`
- `api/appointments.js`
- `lib/mongodb.js`
- `lib/slots.js`
- `lib/calendar.js`
- `lib/email.js`
- `package.json`
- `.env.example`

## Run Locally

Install dependencies:

```bash
npm install
```

Run the Vercel local server:

```bash
npx vercel dev --listen 3000
```

Open:

- `http://localhost:3000`

## Environment Variables

- `MONGODB_URI`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Notes

- The clinic website is served from the root `index.html`
- Booking requests are saved to MongoDB Atlas
- Availability is served from `/api/availability`
- Bookings are submitted to `/api/book`
- Confirmation emails are sent when SMTP is configured
