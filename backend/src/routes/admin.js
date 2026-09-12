const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const {
  listProducts, createProduct, updateProduct, deleteProduct,
  listOrders, updateOrderStatus, processReturnRequest, getDashboard,
  listReturns, updateReturnStatus,
} = require('../controllers/admin');

router.use(authenticate, requireAdmin);

router.get('/dashboard',                  getDashboard);
router.get('/products',                   listProducts);
router.post('/products',                  createProduct);
router.put('/products/:id',               updateProduct);
router.patch('/products/:id',             updateProduct);   // alias for stock updates
router.delete('/products/:id',            deleteProduct);
router.get('/orders',                     listOrders);
router.put('/orders/:id/status',          updateOrderStatus);
router.put('/orders/:id/return-process',  processReturnRequest);

// Returns management
router.get('/returns',                    listReturns);
router.patch('/returns/:id',              updateReturnStatus);

module.exports = router;
