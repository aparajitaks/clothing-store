const router = require('express').Router();
const { checkPincode } = require('../controllers/shipping');

router.get('/pincode/:pincode', checkPincode);

module.exports = router;
