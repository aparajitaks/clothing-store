const Razorpay = require('razorpay');

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('✅ Razorpay client initialized');
} else {
  console.warn('⚠️  RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET not set — payment routes will use simulated sandbox');
}

module.exports = razorpay;
