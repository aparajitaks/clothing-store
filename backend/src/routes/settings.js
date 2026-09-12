const router = require('express').Router();
const { getSettings, updateSettings } = require('../controllers/settings');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', getSettings);
router.put('/', authenticate, requireAdmin, updateSettings);

module.exports = router;
