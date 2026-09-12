const router = require('express').Router();
const { createOrder, verifyPayment, getMyOrders, getOrderById, submitReturnRequest } = require('../controllers/orders');
const { optionalAuthenticate, authenticate } = require('../middleware/auth');

// Allow checkout as guest or authenticated user
router.post('/create', optionalAuthenticate, createOrder);
router.post('/verify', optionalAuthenticate, verifyPayment);
router.get('/', optionalAuthenticate, getMyOrders);
router.get('/:id', optionalAuthenticate, getOrderById);
router.post('/:id/return-request', optionalAuthenticate, submitReturnRequest);

module.exports = router;
