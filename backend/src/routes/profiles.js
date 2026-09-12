const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/apiResponse');

router.use(authenticate);

router.get('/me', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, addresses(*)')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;
    return success(res, data);
  } catch (err) { next(err); }
});

router.put('/me', async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name, phone, avatar_url })
      .eq('id', req.user.id)
      .select()
      .single();
    if (error) throw error;
    return success(res, data, 'Profile updated');
  } catch (err) { next(err); }
});

module.exports = router;
