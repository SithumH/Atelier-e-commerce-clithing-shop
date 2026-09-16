const router = require('express').Router();
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon } = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', removeCartItem);
router.delete('/', clearCart);
router.post('/apply-coupon', applyCoupon);

module.exports = router;
