const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

const generateOrderNumber = () => 'ATL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { shipping_address, payment_method, coupon_code, notes } = req.body;
  if (!shipping_address) return res.status(400).json({ message: 'Shipping address required' });

  // Get cart items
  const [[cart]] = await pool.query('SELECT id FROM carts WHERE user_id = ?', [req.user.id]);
  if (!cart) return res.status(400).json({ message: 'Cart is empty' });

  const [cartItems] = await pool.query(
    'SELECT ci.*, p.price, p.discount_price, p.stock_quantity, p.name FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
    [cart.id]
  );
  if (!cartItems.length) return res.status(400).json({ message: 'Cart is empty' });

  // Validate stock
  for (const item of cartItems) {
    if (item.stock_quantity < item.quantity) return res.status(400).json({ message: `Insufficient stock for ${item.name}` });
  }

  let subtotal = cartItems.reduce((sum, i) => sum + (i.discount_price || i.price) * i.quantity, 0);
  let discount = 0;

  // Apply coupon
  if (coupon_code) {
    const [[coupon]] = await pool.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (valid_until IS NULL OR valid_until > NOW())',
      [coupon_code]
    );
    if (coupon && subtotal >= coupon.min_order_amount) {
      discount = coupon.discount_type === 'percentage' ? (subtotal * coupon.discount_value) / 100 : coupon.discount_value;
      await pool.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [coupon.id]);
    }
  }

  const shipping_cost = subtotal > 100 ? 0 : 10;
  const tax = (subtotal - discount) * 0.08;
  const total = subtotal - discount + shipping_cost + tax;
  const order_number = generateOrderNumber();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      'INSERT INTO orders (order_number, user_id, subtotal, shipping_cost, tax, discount, total, payment_method, shipping_address, coupon_code, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [order_number, req.user.id, subtotal, shipping_cost, tax, discount, total, payment_method || 'cod', JSON.stringify(shipping_address), coupon_code || null, notes || null]
    );

    const orderId = orderResult.insertId;

    // Insert order items & update stock
    for (const item of cartItems) {
      const itemPrice = item.discount_price || item.price;
      await conn.query('INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?,?,?,?,?)',
        [orderId, item.product_id, item.quantity, itemPrice, itemPrice * item.quantity]);
      await conn.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await conn.query('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);

    await conn.commit();
    res.status(201).json({ message: 'Order placed', order_number, order_id: orderId, total: total.toFixed(2) });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/orders
const getOrders = asyncHandler(async (req, res) => {
  const [orders] = await pool.query(
    'SELECT id, order_number, status, total, payment_status, created_at, (SELECT COUNT(*) FROM order_items WHERE order_id = orders.id) AS items_count FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json(orders);
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const [items] = await pool.query(
    'SELECT oi.*, p.name, (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
    [order.id]
  );
  res.json({ ...order, items });
});

// POST /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['pending', 'processing'].includes(order.status)) return res.status(400).json({ message: 'Order cannot be cancelled' });

  await pool.query('UPDATE orders SET status = ? WHERE id = ?', ['cancelled', order.id]);

  // Restore stock
  const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
  for (const item of items) {
    await pool.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [item.quantity, item.product_id]);
  }
  res.json({ message: 'Order cancelled' });
});

// Admin: GET /api/admin/orders
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) { where = 'WHERE o.status = ?'; params.push(status); }

  const [orders] = await pool.query(
    `SELECT o.*, u.name AS customer_name, u.email FROM orders o JOIN users u ON o.user_id = u.id ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), offset]
  );
  res.json(orders);
});

// Admin: PUT /api/admin/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, tracking_number } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  await pool.query('UPDATE orders SET status = ?, tracking_number = COALESCE(?, tracking_number) WHERE id = ?',
    [status, tracking_number || null, req.params.id]);
  res.json({ message: 'Order status updated' });
});

module.exports = { createOrder, getOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus };
