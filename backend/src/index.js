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
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security ────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

// ─── Webhook route MUST come before body parser (raw body needed for HMAC) ──
app.use('/api/webhooks', webhookRoutes);

// ─── Body Parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/coupons',    couponRoutes);
app.use('/api/shipping',   shippingRoutes);
app.use('/api/settings',   settingsRoutes);

// ─── 404 ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🛍️  TeyaCollections API running on http://localhost:${PORT}`);
    console.log(`📦  Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;
