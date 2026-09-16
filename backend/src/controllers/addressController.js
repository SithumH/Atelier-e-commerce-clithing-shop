const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// GET /api/addresses
const getAddresses = asyncHandler(async (req, res) => {
  const [addresses] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [req.user.id]);
  res.json(addresses);
});

// POST /api/addresses
const addAddress = asyncHandler(async (req, res) => {
  const { type, name, street, apartment, city, state, country, zip_code, phone, is_default } = req.body;
  if (is_default) await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
  const [result] = await pool.query(
    'INSERT INTO addresses (user_id, type, name, street, apartment, city, state, country, zip_code, phone, is_default) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [req.user.id, type || 'shipping', name, street, apartment || null, city, state || null, country, zip_code || null, phone || null, is_default || false]
  );
  res.status(201).json({ message: 'Address added', id: result.insertId });
});

// PUT /api/addresses/:id
const updateAddress = asyncHandler(async (req, res) => {
  const { name, street, apartment, city, state, country, zip_code, phone } = req.body;
  await pool.query(
    'UPDATE addresses SET name=?, street=?, apartment=?, city=?, state=?, country=?, zip_code=?, phone=? WHERE id=? AND user_id=?',
    [name, street, apartment, city, state, country, zip_code, phone, req.params.id, req.user.id]
  );
  res.json({ message: 'Address updated' });
});

// DELETE /api/addresses/:id
const deleteAddress = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Address deleted' });
});

// PUT /api/addresses/:id/default
const setDefaultAddress = asyncHandler(async (req, res) => {
  await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
  await pool.query('UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ message: 'Default address set' });
});

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress };
