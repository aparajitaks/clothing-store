import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import './Contact.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    // Simulate sending — connect to real email API in production
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <motion.div
          className="contact-hero__content container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="contact-eyebrow">Get in Touch</p>
          <h1 className="contact-title">Contact Our Concierge</h1>
          <p className="contact-hero__sub">
            For styling consultations, bespoke orders, size guidance, or any enquiries —
            our team is happy to assist.
          </p>
        </motion.div>
      </div>

      <div className="contact-body container">
        {/* Contact Info */}
        <motion.div
          className="contact-info"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="contact-info__block">
            <div className="contact-info__icon"><Mail size={20} /></div>
            <div>
              <p className="contact-info__label">Email</p>
              <a href="mailto:care@tiyacollections.com" className="contact-info__value">care@tiyacollections.com</a>
            </div>
          </div>
          <div className="contact-info__block">
            <div className="contact-info__icon"><Phone size={20} /></div>
            <div>
              <p className="contact-info__label">Phone</p>
              <a href="tel:+919876543210" className="contact-info__value">+91 98765 43210</a>
              <p className="contact-info__note">Mon – Sat, 10am – 7pm IST</p>
            </div>
          </div>
          <div className="contact-info__block">
            <div className="contact-info__icon"><MapPin size={20} /></div>
            <div>
              <p className="contact-info__label">Studio</p>
              <p className="contact-info__value">Studio TK, Heritage Quarter</p>
              <p className="contact-info__note">MG Road, Bangalore 560001<br />Karnataka, India</p>
            </div>
          </div>

          <div className="contact-response-time">
            <p>We typically respond within <strong>24 hours</strong> on business days.</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="contact-form-wrap"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {submitted ? (
            <div className="contact-success">
              <CheckCircle size={40} className="contact-success__icon" />
              <h2>Message Received</h2>
              <p>Thank you, {form.name}. Our concierge will respond within 24 hours.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form__row">
                <div className="form-group">
                  <label htmlFor="contact-name">Full Name *</label>
                  <input id="contact-name" name="name" type="text" value={form.name} onChange={handleChange} required placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="contact-subject">Subject *</label>
                <select id="contact-subject" name="subject" value={form.subject} onChange={handleChange} required>
                  <option value="">Select a topic</option>
                  <option>Order Query</option>
                  <option>Return / Exchange</option>
                  <option>Size Guidance</option>
                  <option>Bespoke / Custom Order</option>
                  <option>Wholesale Enquiry</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message *</label>
                <textarea id="contact-message" name="message" rows={5} value={form.message} onChange={handleChange} required placeholder="Tell us how we can help..." />
              </div>
              <button type="submit" className="btn-primary contact-form__submit" disabled={submitting}>
                {submitting ? 'Sending...' : <><Send size={16} /> Send Message</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
