const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

const getOrCreateCart = async (userId) => {
  let [carts] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [userId]);
  if (!carts.length) {
    const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    return result.insertId;
  }
  return carts[0].id;
};

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  const [items] = await pool.query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.discount_price, p.stock_quantity,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
     FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?`,
    [cartId]
  );
  const total = items.reduce((sum, i) => sum + (i.discount_price || i.price) * i.quantity, 0);
  res.json({ items, total: total.toFixed(2) });
});

// POST /api/cart/items
const addToCart = asyncHandler(async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const [[product]] = await pool.query('SELECT id, stock_quantity FROM products WHERE id = ? AND is_active = 1', [product_id]);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.stock_quantity < quantity) return res.status(400).json({ message: 'Insufficient stock' });

  const cartId = await getOrCreateCart(req.user.id);
  await pool.query(
    'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
    [cartId, product_id, quantity, quantity]
  );
  res.status(201).json({ message: 'Added to cart' });
});

// PUT /api/cart/items/:id
const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });
  await pool.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
  res.json({ message: 'Cart updated' });
});

// DELETE /api/cart/items/:id
const removeCartItem = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE id = ?', [req.params.id]);
  res.json({ message: 'Item removed' });
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  const cartId = await getOrCreateCart(req.user.id);
  await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  res.json({ message: 'Cart cleared' });
});

// POST /api/cart/apply-coupon
const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const [[coupon]] = await pool.query(
    'SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW()) AND (max_uses IS NULL OR used_count < max_uses)',
    [code]
  );
  if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon' });
  res.json({ coupon: { code: coupon.code, discount_type: coupon.discount_type, discount_value: coupon.discount_value, min_order_amount: coupon.min_order_amount } });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyCoupon };
