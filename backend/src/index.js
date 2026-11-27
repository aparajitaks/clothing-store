require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const productRoutes   = require('./routes/products');
const categoryRoutes  = require('./routes/categories');
const orderRoutes     = require('./routes/orders');
const cartRoutes      = require('./routes/cart');
const adminRoutes     = require('./routes/admin');
const webhookRoutes   = require('./routes/webhooks');
const profileRoutes   = require('./routes/profiles');
const wishlistRoutes  = require('./routes/wishlist');
const reviewRoutes    = require('./routes/reviews');
const couponRoutes    = require('./routes/coupons');
const shippingRoutes  = require('./routes/shipping');
const settingsRoutes  = require('./routes/settings');
const contactRoutes   = require('./routes/contact');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Behind a cloud proxy (Render/Vercel/etc.) trust the first proxy hop so
// express-rate-limit reads the real client IP from X-Forwarded-For.
app.set('trust proxy', 1);

// ─── Security ────────────────────────────────────────────────
app.use(helmet());

// CORS allowlist — CLIENT_URL can be a comma-separated list of origins.
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'https://teyacollections.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const DEV_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const IS_PROD = process.env.NODE_ENV === 'production';

app.use(cors({
  // CLIENT_URL may hold a comma-separated allowlist of production origins.
  // Local dev origins (Vite dev 5173 / preview 4173) are also allowed outside production.
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    if (!IS_PROD && DEV_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for coupon validation — prevents brute-force enumeration
const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many coupon attempts, please try again later.' },
});

// Stricter limit for order creation — prevents order flooding
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many order attempts, please try again later.' },
});

// ─── Webhook route MUST come before body parser (raw body needed for HMAC) ──
app.use('/api/webhooks', webhookRoutes);

// ─── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// ─── Logging ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/admin',      adminRoutes);
app.use('/api/profiles',   profileRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/reviews',    reviewRoutes);
// Apply coupon rate limiter before coupon routes
app.use('/api/coupons/validate', couponLimiter);
app.use('/api/coupons',    couponRoutes);
// Apply order rate limiter to creation endpoint
app.use('/api/orders/create', orderLimiter);
app.use('/api/shipping',   shippingRoutes);
app.use('/api/settings',   settingsRoutes);
app.use('/api/contact',    contactRoutes);

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🛍️  TeyaCollections API running on port ${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
