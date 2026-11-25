const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/apiResponse');

const localCarts = new Map();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cart')
          .select('items, updated_at')
          .eq('user_id', req.user.id)
          .single();
        if (error && error.code !== 'PGRST116') throw error;
        return success(res, data || { items: [] });
      } catch (e) { /* fallback */ }
    }
    return success(res, localCarts.get(req.user.id) || { items: [] });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { items } = req.body;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('cart')
          .upsert({ user_id: req.user.id, items, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
          .select()
          .single();
        if (!error && data) return success(res, data, 'Cart updated');
      } catch (e) { /* fallback */ }
    }
    const record = { user_id: req.user.id, items, updated_at: new Date().toISOString() };
    localCarts.set(req.user.id, record);
    return success(res, record, 'Cart updated');
  } catch (err) { next(err); }
});

router.delete('/', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        await supabase.from('cart').delete().eq('user_id', req.user.id);
      } catch (e) { /* fallback */ }
    }
    localCarts.delete(req.user.id);
    return success(res, {}, 'Cart cleared');
  } catch (err) { next(err); }
});

module.exports = router;
