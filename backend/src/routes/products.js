const router = require('express').Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getReviews, addReview } = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/:slug', getProduct);
router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', authenticate, addReview);
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;
