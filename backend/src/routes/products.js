const router = require('express').Router();
const {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getCollections,
  getCollectionBySlug,
  getSearchSuggestions,
} = require('../controllers/products');

router.get('/',                      getProducts);
router.get('/featured',              getFeaturedProducts);
router.get('/suggestions',           getSearchSuggestions);
router.get('/collections',           getCollections);
router.get('/collections/:slug',      getCollectionBySlug);
router.get('/:slug',                 getProductBySlug);

module.exports = router;
