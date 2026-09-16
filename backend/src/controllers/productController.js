const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const { category, brand, min_price, max_price, rating, search, sort, page = 1, limit = 12, featured } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE p.is_active = 1';

  if (category) { where += ' AND c.slug = ?'; params.push(category); }
  if (brand) { where += ' AND p.brand = ?'; params.push(brand); }
  if (min_price) { where += ' AND p.price >= ?'; params.push(min_price); }
  if (max_price) { where += ' AND p.price <= ?'; params.push(max_price); }
  if (rating) { where += ' AND p.rating >= ?'; params.push(rating); }
  if (featured) { where += ' AND p.is_featured = 1'; }
  if (search) { where += ' AND (p.name LIKE ? OR p.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  const sortMap = { price_asc: 'p.price ASC', price_desc: 'p.price DESC', newest: 'p.created_at DESC', popular: 'p.reviews_count DESC' };
  const orderBy = sortMap[sort] || 'p.created_at DESC';

  const sql = `
    SELECT p.*, c.name AS category_name, c.slug AS category_slug,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
    FROM products p LEFT JOIN categories c ON p.category_id = c.id
    ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

  const [products] = await pool.query(sql, [...params, parseInt(limit), offset]);
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`, params);

  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// GET /api/products/:slug
const getProduct = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1`,
    [req.params.slug]
  );
  if (!rows[0]) return res.status(404).json({ message: 'Product not found' });

  const [images] = await pool.query('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order', [rows[0].id]);
  res.json({ ...rows[0], images });
});

// POST /api/products (admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discount_price, stock_quantity, category_id, brand, is_featured } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();

  const [result] = await pool.query(
    'INSERT INTO products (name, slug, description, price, discount_price, stock_quantity, category_id, brand, is_featured) VALUES (?,?,?,?,?,?,?,?,?)',
    [name, slug, description, price, discount_price || null, stock_quantity || 0, category_id || null, brand || null, is_featured || false]
  );
  res.status(201).json({ message: 'Product created', id: result.insertId, slug });
});

// PUT /api/products/:id (admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, discount_price, stock_quantity, category_id, brand, is_featured, is_active } = req.body;
  await pool.query(
    'UPDATE products SET name=?, description=?, price=?, discount_price=?, stock_quantity=?, category_id=?, brand=?, is_featured=?, is_active=? WHERE id=?',
    [name, description, price, discount_price, stock_quantity, category_id, brand, is_featured, is_active, req.params.id]
  );
  res.json({ message: 'Product updated' });
});

// DELETE /api/products/:id (admin)
const deleteProduct = asyncHandler(async (req, res) => {
  await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
  res.json({ message: 'Product deleted' });
});

// GET /api/products/:id/reviews
const getReviews = asyncHandler(async (req, res) => {
  const [reviews] = await pool.query(
    'SELECT r.*, u.name AS user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC',
    [req.params.id]
  );
  res.json(reviews);
});

// POST /api/products/:id/reviews
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });

  await pool.query(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE rating=?, comment=?',
    [req.params.id, req.user.id, rating, comment, rating, comment]
  );

  // Update product average rating
  await pool.query(
    'UPDATE products SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ? AND is_approved = 1), reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ? AND is_approved = 1) WHERE id = ?',
    [req.params.id, req.params.id, req.params.id]
  );
  res.status(201).json({ message: 'Review submitted, pending approval' });
});

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getReviews, addReview };
