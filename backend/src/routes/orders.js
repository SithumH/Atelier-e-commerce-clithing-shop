const router = require('express').Router();
const { createOrder, getOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Admin
router.get('/admin/all', isAdmin, getAllOrders);
router.put('/admin/:id/status', isAdmin, updateOrderStatus);

module.exports = router;
