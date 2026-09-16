const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// GET /api/wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const [items] = await pool.query(
    `SELECT w.id, p.id AS product_id, p.name, p.price, p.discount_price, p.rating,
      (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
     FROM wishlists w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?`,
    [req.user.id]
  );
  res.json(items);
});

// POST /api/wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { product_id } = req.body;
  await pool.query('INSERT IGNORE INTO wishlists (user_id, product_id) VALUES (?,?)', [req.user.id, product_id]);
  res.status(201).json({ message: 'Added to wishlist' });
});

// DELETE /api/wishlist/:productId
const removeFromWishlist = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM wishlists WHERE user_id = ? AND product_id = ?', [req.user.id, req.params.productId]);
  res.json({ message: 'Removed from wishlist' });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
