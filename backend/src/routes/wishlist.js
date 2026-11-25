const router = require('express').Router();
const supabase = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { success, notFound } = require('../utils/apiResponse');
const inventoryService = require('../services/inventoryService');

const localWishlists = new Map();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select('id, product_id, products(id, name, slug, price, images)')
          .eq('user_id', req.user.id);
        if (!error && data) return success(res, data);
      } catch (e) { /* fallback */ }
    }
    const ids = localWishlists.get(req.user.id) || new Set();
    const items = [];
    for (const pid of ids) {
      const p = inventoryService.getProductBySlug(pid);
      if (p) items.push({ id: pid, product_id: pid, products: { id: p.id, name: p.name, slug: p.slug, price: p.price, images: p.images } });
    }
    return success(res, items);
  } catch (err) { next(err); }
});

router.post('/:productId', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('wishlist')
          .upsert({ user_id: req.user.id, product_id: req.params.productId }, { onConflict: 'user_id,product_id' })
          .select()
          .single();
        if (!error && data) return success(res, data, 'Added to wishlist');
      } catch (e) { /* fallback */ }
    }
    const set = localWishlists.get(req.user.id) || new Set();
    set.add(req.params.productId);
    localWishlists.set(req.user.id, set);
    return success(res, { id: req.params.productId, product_id: req.params.productId }, 'Added to wishlist');
  } catch (err) { next(err); }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        await supabase.from('wishlist').delete().eq('user_id', req.user.id).eq('product_id', req.params.productId);
      } catch (e) { /* fallback */ }
    }
    const set = localWishlists.get(req.user.id);
    if (set) set.delete(req.params.productId);
    return success(res, {}, 'Removed from wishlist');
  } catch (err) { next(err); }
});

module.exports = router;
