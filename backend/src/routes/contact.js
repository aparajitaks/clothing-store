const router = require('express').Router();
const rateLimit = require('express-rate-limit');

// Rate limit: 5 contact submissions per IP per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many submissions from this IP, please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/contact
 * Store contact form submission and optionally email the business owner.
 */
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    const errors = {};
    if (!name || String(name).trim().length < 2) errors.name = 'Name is required (min 2 characters).';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) errors.email = 'Valid email address is required.';
    if (!message || String(message).trim().length < 10) errors.message = 'Message is required (min 10 characters).';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation failed', fields: errors });
    }

    const sanitised = {
      name: String(name).trim().slice(0, 120),
      email: String(email).trim().toLowerCase().slice(0, 254),
      subject: subject ? String(subject).trim().slice(0, 200) : 'General Enquiry',
      message: String(message).trim().slice(0, 2000),
      submitted_at: new Date().toISOString(),
    };

    // Try to persist to Supabase if available
    try {
      const supabase = require('../config/db');
      if (supabase && typeof supabase.from === 'function') {
        const { error: dbErr } = await supabase
          .from('contact_submissions')
          .insert(sanitised);
        if (dbErr) {
          console.warn('[contact] DB insert failed (non-fatal):', dbErr.message);
        }
      }
    } catch (dbErr) {
      // DB table missing or unavailable — log and continue (don't fail the user)
      console.warn('[contact] DB insert failed (non-fatal):', dbErr.message);
    }

    // Try to send email notification to owner
    try {
      const emailService = require('../services/emailService');
      const ownerEmail = process.env.OWNER_EMAIL;
      if (ownerEmail && typeof emailService.sendContactNotification === 'function') {
        await emailService.sendContactNotification(ownerEmail, sanitised);
      }
    } catch (emailErr) {
      console.warn('[contact] Owner email failed (non-fatal):', emailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you within 24 hours.',
    });
  } catch (err) {
    console.error('[contact] Unexpected error:', err);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

module.exports = router;
