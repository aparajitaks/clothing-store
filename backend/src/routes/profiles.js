const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/apiResponse');

const localProfiles = new Map();

router.use(authenticate);

router.get('/me', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*, addresses(*)')
          .eq('id', req.user.id)
          .single();
        if (!error && data) return success(res, data);
      } catch (e) { /* fallback */ }
    }
    const fallback = localProfiles.get(req.user.id) || {
      id: req.user.id,
      full_name: req.user.email?.split('@')[0] || 'Guest',
      email: req.user.email,
      phone: null,
      avatar_url: null,
      addresses: [],
    };
    return success(res, fallback);
  } catch (err) { next(err); }
});

router.put('/me', async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update({ full_name, phone, avatar_url })
          .eq('id', req.user.id)
          .select()
          .single();
        if (!error && data) return success(res, data, 'Profile updated');
      } catch (e) { /* fallback */ }
    }
    const existing = localProfiles.get(req.user.id) || { id: req.user.id, email: req.user.email };
    const updated = { ...existing, full_name, phone, avatar_url };
    localProfiles.set(req.user.id, updated);
    return success(res, updated, 'Profile updated');
  } catch (err) { next(err); }
});

module.exports = router;
