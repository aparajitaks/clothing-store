const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, badRequest } = require('../utils/apiResponse');

router.get('/:productId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, title, comment, created_at, profiles(full_name, avatar_url)')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return success(res, data);
  } catch (err) { next(err); }
});

router.post('/:productId', authenticate, async (req, res, next) => {
  try {
    const { rating, title, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) return badRequest(res, 'Rating must be 1-5');
    const { data, error } = await supabase
      .from('reviews')
      .upsert({ product_id: req.params.productId, user_id: req.user.id, rating, title, comment }, { onConflict: 'product_id,user_id' })
      .select()
      .single();
    if (error) throw error;
    return success(res, data, 'Review submitted');
  } catch (err) { next(err); }
});

router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    await supabase.from('reviews').delete().eq('product_id', req.params.productId).eq('user_id', req.user.id);
    return success(res, {}, 'Review deleted');
  } catch (err) { next(err); }
});

module.exports = router;
