const router = require('express').Router();
const { validateCoupon, listCoupons, createCoupon, deleteCoupon } = require('../controllers/coupons');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Public validation for cart & checkout
router.post('/validate', validateCoupon);

// Admin routes
router.get('/', authenticate, requireAdmin, listCoupons);
router.post('/', authenticate, requireAdmin, createCoupon);
router.delete('/:code', authenticate, requireAdmin, deleteCoupon);

module.exports = router;
