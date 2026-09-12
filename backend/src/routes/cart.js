const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/apiResponse');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('cart')
      .select('items, updated_at')
      .eq('user_id', req.user.id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return success(res, data || { items: [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { items } = req.body;
    const { data, error } = await supabase
      .from('cart')
      .upsert({ user_id: req.user.id, items, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select()
      .single();
    if (error) throw error;
    return success(res, data, 'Cart updated');
  } catch (err) { next(err); }
});

router.delete('/', async (req, res, next) => {
  try {
    await supabase.from('cart').delete().eq('user_id', req.user.id);
    return success(res, {}, 'Cart cleared');
  } catch (err) { next(err); }
});

module.exports = router;
