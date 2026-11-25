const router = require('express').Router();
const { checkPincode, calculateShipping, calculateTax } = require('../controllers/shipping');

// Pincode deliverability check — two route aliases for backward compatibility
router.get('/pincode/:pincode', checkPincode);
router.get('/check-pincode/:pincode', checkPincode);   // alias used by frontend

// Calculate shipping fee for a given subtotal + optional pincode
router.post('/calculate', calculateShipping);

// Calculate tax breakdown for order items
router.post('/tax', calculateTax);

module.exports = router;
