# NeoMotion PhysioTherapy Website

NeoMotion PhysioTherapy is a static marketing and booking site for a physiotherapy clinic in Ghaziabad. The frontend is served from a single root `index.html`, while booking, availability, and appointment data are handled by serverless API routes designed for Vercel.

## Stack

- Static HTML, CSS, and vanilla JavaScript in `index.html`
- Vercel-style serverless functions in `api/`
- MongoDB Atlas for appointment storage
- Nodemailer for optional booking confirmation emails

## Project Structure

- `index.html`:
  Main website UI, booking form, SEO metadata, and optional Google Analytics loader.
- `api/book.js`:
  Validates a booking request, prevents duplicate slot creation, stores the booking, and sends a confirmation email when SMTP is configured.
- `api/availability.js`:
  Returns open time slots for a selected date.
- `api/appointments.js`:
  Returns appointments in a date range for slot preloading and calendar-style event consumers.
- `lib/mongodb.js`:
  Shared MongoDB connection helper.
- `lib/slots.js`:
  Slot generation and time filtering logic.
- `lib/appointments.js`:
  Appointment query helpers and event shaping.
- `lib/calendar.js`:
  Date formatting plus ICS and Google Calendar link generation.
- `lib/email.js`:
  Booking confirmation email delivery.
- `scripts/test-book-api.js`:
  Lightweight handler smoke test.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` values into your local environment and replace placeholders.

3. Run the site with Vercel's local server:

```bash
npx vercel dev --listen 3000
```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

The serverless APIs use the following variables:

- `MONGODB_URI`: MongoDB Atlas connection string for the `neomotion` database.
- `SMTP_HOST`: SMTP hostname for outgoing confirmation emails.
- `SMTP_PORT`: SMTP port, such as `587` or `465`.
- `SMTP_USER`: SMTP username.
- `SMTP_PASS`: SMTP password or app password.
- `SMTP_FROM`: Sender name and email shown on confirmations.

## Booking Flow

1. The booking form in `index.html` loads service options from the page content.
2. The client preloads appointments from `/api/appointments` for an upcoming date range.
3. If a date is not preloaded, the client requests fresh availability from `/api/availability`.
4. When a user submits the form, the client posts to `/api/book`.
5. The API validates the payload, checks for duplicate bookings, stores the appointment, and optionally sends a confirmation email with calendar attachments.

## SEO Metadata

The site head includes:

- Canonical URL
- Hreflang hints
- Open Graph metadata
- Twitter card metadata
- `MedicalBusiness` and `WebSite` JSON-LD structured data
- Theme color and robots directives
- `robots.txt`
- `sitemap.xml`

If the production domain changes, update the canonical URL, Open Graph URLs, structured data in `index.html`, and the absolute URLs in `robots.txt` and `sitemap.xml`.

## Analytics Setup

The site includes an optional Google Analytics 4 loader in `index.html`.

To enable it:

1. Create or open your GA4 property.
2. Copy the Measurement ID, which looks like `G-XXXXXXXXXX`.
3. In `index.html`, set the `content` value of:

```html
<meta name="google-analytics-id" content="G-XXXXXXXXXX">
```

4. Redeploy the site.

If the meta tag is left empty, no analytics script is loaded.

## Notes

- The frontend currently keeps some slot logic in both `index.html` and `lib/slots.js`, so booking rule changes should be updated in both places.
- The project expects a modern Node.js version for local tooling.
- The public site domain in `CNAME` is `neomotionphysio.in`.
