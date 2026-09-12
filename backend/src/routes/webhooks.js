const router = require('express').Router();
const express = require('express');
const { razorpayWebhook } = require('../controllers/webhooks');

// Capture raw body for HMAC verification BEFORE express.json parses it
router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body.toString();
    next();
  },
  razorpayWebhook
);

module.exports = router;
