const router = require('express').Router();
const supabase = require('../config/db');
const { success, notFound } = require('../utils/apiResponse');
const { SEED_CATEGORIES } = require('../data/seedData');

router.get('/', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (!error && data && data.length > 0) {
          return success(res, data);
        }
      } catch (e) {
        // Fallback to seed categories
      }
    }
    return success(res, SEED_CATEGORIES.filter(c => c.is_active));
  } catch (err) { next(err); }
});

router.get('/:slug', async (req, res, next) => {
  try {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', req.params.slug)
          .eq('is_active', true)
          .single();
        if (!error && data) return success(res, data);
      } catch (e) {
        // Fallback to seed category
      }
    }
    const cat = SEED_CATEGORIES.find(c => c.slug === req.params.slug && c.is_active);
    if (!cat) return notFound(res, 'Category not found');
    return success(res, cat);
  } catch (err) { next(err); }
});

module.exports = router;
