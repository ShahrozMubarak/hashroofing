import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.disable('x-powered-by');
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json({ limit: '16kb' }));

// Small in-memory limiter for a single-instance deployment.
// Use a shared store before running multiple API instances.
const rateBuckets = new Map();
function rateLimit(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const entry = rateBuckets.get(ip) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }
  entry.count += 1;
  rateBuckets.set(ip, entry);
  if (entry.count > 10) return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a few minutes and try again.' });
  next();
}

const VALID_SERVICES = new Set(['Roof replacement', 'Roof installation', 'Roof repair', 'Roof inspections']);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'auren-roofing-api', timestamp: new Date().toISOString() });
});

app.post('/api/contact', rateLimit, async (req, res) => {
  const { name, email, phone, zip, service, message, website } = req.body || {};

  // Honeypot: do not process automated submissions.
  if (typeof website === 'string' && website.trim().length > 0) {
    return res.status(200).json({ ok: true, delivered: false, status: 'received' });
  }

  const cleanName = typeof name === 'string' ? name.trim().slice(0, 100) : '';
  const cleanEmail = typeof email === 'string' ? email.trim().slice(0, 254) : '';
  const cleanPhone = typeof phone === 'string' ? phone.trim().slice(0, 40) : '';
  const cleanZip = typeof zip === 'string' ? zip.trim() : '';
  const cleanService = typeof service === 'string' ? service.trim() : '';
  const cleanMessage = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
  const errors = {};

  if (cleanName.length < 2) errors.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) errors.email = 'Please enter a valid email address.';
  if (cleanPhone.replace(/\D/g, '').length < 7) errors.phone = 'Please enter a valid phone number.';
  if (!/^\d{5}(-\d{4})?$/.test(cleanZip)) errors.zip = 'Please enter a valid 5-digit U.S. ZIP code.';
  if (!VALID_SERVICES.has(cleanService)) errors.service = 'Please select a valid roofing service.';
  if (Object.keys(errors).length) return res.status(400).json({ ok: false, errors });

  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL;
  const sender = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !recipient || !sender) {
    return res.status(503).json({
      ok: false, delivered: false, status: 'integration_pending',
      error: 'The contact form is not connected to the company inbox yet. Configure the email settings before accepting live inquiries.'
    });
  }

  const emailText = [
    'New roofing estimate request', '',
    `Name: ${cleanName}`, `Email: ${cleanEmail}`, `Phone: ${cleanPhone}`,
    `Property ZIP: ${cleanZip}`, `Service: ${cleanService}`, '',
    'Project details:', cleanMessage || 'No additional details provided.'
  ].join('\n');

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: sender, to: [recipient], reply_to: cleanEmail,
        subject: `New roofing inquiry — ${cleanService}`, text: emailText
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!resendResponse.ok) {
      return res.status(502).json({
        ok: false, delivered: false, status: 'delivery_failed',
        error: 'We could not deliver your request right now. Please try again or contact the company directly.'
      });
    }
    return res.status(200).json({ ok: true, delivered: true, status: 'received', message: 'Your request has been sent successfully.' });
  } catch (_error) {
    return res.status(502).json({
      ok: false, delivered: false, status: 'delivery_failed',
      error: 'We could not deliver your request right now. Please try again or contact the company directly.'
    });
  }
});

app.listen(PORT, () => console.log(`Auren Roofing API listening on http://localhost:${PORT}`));
