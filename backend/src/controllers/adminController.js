const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// GET /api/admin/dashboard
const getDashboard = asyncHandler(async (req, res) => {
  const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
  const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total), 0) AS total_revenue FROM orders WHERE payment_status = 'paid'");
  const [[{ total_users }]] = await pool.query("SELECT COUNT(*) AS total_users FROM users WHERE role = 'customer'");
  const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products WHERE is_active = 1');
  const [recent_orders] = await pool.query(
    'SELECT o.id, o.order_number, o.total, o.status, u.name AS customer FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC LIMIT 5'
  );
  res.json({ total_orders, total_revenue, total_users, total_products, recent_orders });
});

// GET /api/admin/users
const getUsers = asyncHandler(async (req, res) => {
  const [users] = await pool.query('SELECT id, name, email, phone, role, is_verified, created_at FROM users ORDER BY created_at DESC');
  res.json(users);
});

// PUT /api/admin/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { role, is_verified } = req.body;
  await pool.query('UPDATE users SET role=?, is_verified=? WHERE id=?', [role, is_verified, req.params.id]);
  res.json({ message: 'User updated' });
});

// DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'User deleted' });
});

// GET /api/admin/reviews
const getReviews = asyncHandler(async (req, res) => {
  const [reviews] = await pool.query(
    'SELECT r.*, u.name AS user_name, p.name AS product_name FROM reviews r JOIN users u ON r.user_id = u.id JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC'
  );
  res.json(reviews);
});

// PUT /api/admin/reviews/:id/approve
const approveReview = asyncHandler(async (req, res) => {
  await pool.query('UPDATE reviews SET is_approved = 1 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Review approved' });
});

module.exports = { getDashboard, getUsers, updateUser, deleteUser, getReviews, approveReview };
