const router = require('express').Router();
const { getDashboard, getUsers, updateUser, deleteUser, getReviews, approveReview } = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.use(authenticate, isAdmin);
router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/reviews', getReviews);
router.put('/reviews/:id/approve', approveReview);

module.exports = router;
