import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SEO, { buildFAQSchema } from '../components/SEO';
import './FAQ.css';

const FAQ_ITEMS = [
  {
    category: 'Sizing & Fit',
    items: [
      {
        q: 'How do I find my size?',
        a: 'Each product page includes a detailed size chart with measurements in inches and centimetres. We recommend measuring your chest, waist, and hip with a soft measuring tape and comparing against our chart. When in doubt, size up.',
      },
      {
        q: 'Do you offer custom sizing or alterations?',
        a: 'Yes — for select pieces we offer a bespoke tailoring service. Please contact our concierge at care@tiyacollections.com with your measurements and the product you\'re interested in, and we will provide a quotation.',
      },
      {
        q: 'The size I want is out of stock. Will it be restocked?',
        a: 'Handcrafted pieces often take 4–6 weeks to produce. Contact us to join the waitlist for a specific size and we\'ll notify you as soon as it becomes available.',
      },
    ],
  },
  {
    category: 'Orders & Payment',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept UPI, credit and debit cards (Visa, Mastercard, Rupay, Amex), net banking, popular wallets (Paytm, PhonePe, Google Pay), and Cash on Delivery (COD) for eligible orders up to ₹25,000.',
      },
      {
        q: 'Is it safe to pay online on your website?',
        a: 'Yes. All payments are processed through Razorpay, a PCI DSS compliant payment gateway. We never store your card details on our servers.',
      },
      {
        q: 'Can I modify or cancel my order after placing it?',
        a: 'Orders may be modified or cancelled within 2 hours of placement. After this window, your piece will have entered preparation. Contact care@tiyacollections.com immediately if you need to make changes.',
      },
      {
        q: 'Do you offer COD on all orders?',
        a: 'COD is available on orders up to ₹25,000 for most serviceable PIN codes across India. Availability is confirmed at checkout based on your delivery address.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      {
        q: 'How long will my order take to arrive?',
        a: 'Metro cities (Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata): 2–3 business days. Other cities and towns: 4–6 business days. Please allow 1 additional business day for personalised or bespoke pieces.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Currently we ship within India only. International shipping to the US, UK, and Europe is planned for Q1 2025. Join our newsletter to be notified at launch.',
      },
      {
        q: 'What is the free shipping threshold?',
        a: 'Enjoy complimentary shipping on all orders above ₹999. A flat ₹99 shipping fee applies to orders below this amount.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order is shipped, you\'ll receive an email with your courier partner\'s name and tracking number. You can also view real-time order status in My Account → Orders.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 7 days of delivery for unworn, unwashed garments with all original tags and packaging intact. Sale items and personalised pieces are not eligible for return.',
      },
      {
        q: 'How do I initiate a return or exchange?',
        a: 'Log in to My Account → Orders, select the delivered order, and click "Request Return / Exchange". Our concierge will review and confirm within 24 business hours.',
      },
      {
        q: 'How long does a refund take?',
        a: 'Once the returned garment passes quality inspection (2–3 business days after receipt), the refund is processed to your original payment method within 5–7 business days.',
      },
    ],
  },
  {
    category: 'Care & Fabric',
    items: [
      {
        q: 'How should I care for silk and handloom garments?',
        a: 'Most of our pieces require dry cleaning only. Specific care instructions are printed on the garment label and listed on each product page under "Care Instructions". Do not machine wash or soak silk or zari embroidered garments.',
      },
      {
        q: 'Are the fabrics ethically sourced?',
        a: 'Yes. All fabrics are sourced directly from certified GI-tagged weaving clusters and registered handloom cooperatives across India. We conduct periodic artisan audits and prioritise fair-trade practices.',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button className="faq-item__question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="faq-item__answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  // Flatten all FAQ items for JSON-LD schema
  const allFaqs = FAQ_ITEMS.flatMap((s) => s.items.map((i) => ({ question: i.q, answer: i.a })));

  return (
    <>
      <SEO
        title="FAQ — Frequently Asked Questions"
        description="Find answers to common questions about sizing, shipping, returns, and payments at TK TeyaCollections."
        canonical="/faq"
        jsonLd={buildFAQSchema(allFaqs)}
      />
    <div className="faq-page">
      <div className="faq-hero container">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="faq-eyebrow">Support</p>
          <h1 className="faq-title">Frequently Asked Questions</h1>
          <p className="faq-subtitle">Can't find your answer? Write to us at <a href="mailto:care@tiyacollections.com">care@tiyacollections.com</a></p>
        </motion.div>
      </div>

      <div className="faq-body container">
        {FAQ_ITEMS.map((section, si) => (
          <motion.section
            key={section.category}
            className="faq-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: si * 0.05 }}
          >
            <h2 className="faq-section__title">{section.category}</h2>
            <div className="faq-list">
              {section.items.map((item) => (
                <FAQItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
    </>
  );
}
