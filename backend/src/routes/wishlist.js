const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/apiResponse');

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('id, product_id, products(id, name, slug, price, images)')
      .eq('user_id', req.user.id);
    if (error) throw error;
    return success(res, data);
  } catch (err) { next(err); }
});

router.post('/:productId', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .upsert({ user_id: req.user.id, product_id: req.params.productId }, { onConflict: 'user_id,product_id' })
      .select()
      .single();
    if (error) throw error;
    return success(res, data, 'Added to wishlist');
  } catch (err) { next(err); }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    await supabase.from('wishlist').delete().eq('user_id', req.user.id).eq('product_id', req.params.productId);
    return success(res, {}, 'Removed from wishlist');
  } catch (err) { next(err); }
});

module.exports = router;
