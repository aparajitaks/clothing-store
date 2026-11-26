import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../lib/axios';
import './Contact.css';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    // Clear field-level error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors((fe) => ({ ...fe, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const clientErrors = {};
    if (!form.name || form.name.trim().length < 2) {
      clientErrors.name = 'Name is required (min 2 characters).';
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      clientErrors.email = 'Valid email address is required.';
    }
    if (!form.message || form.message.trim().length < 10) {
      clientErrors.message = 'Message is required (min 10 characters).';
    }
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
    } catch (err) {
      const data = err.response?.data;
      if (data?.fields) {
        setFieldErrors(data.fields);
      } else {
        setError(data?.error || 'Could not reach our concierge server. Please write directly to care@teyacollections.com.');
      }
    } finally {
      setSubmitting(false);
    }
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
              <a href="mailto:care@teyacollections.com" className="contact-info__value">care@teyacollections.com</a>
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
                  {fieldErrors.name && <span className="form-field-error">{fieldErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="contact-email">Email Address *</label>
                  <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" />
                  {fieldErrors.email && <span className="form-field-error">{fieldErrors.email}</span>}
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
                {fieldErrors.message && <span className="form-field-error">{fieldErrors.message}</span>}
              </div>
              {error && (
                <div className="contact-form__error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
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
