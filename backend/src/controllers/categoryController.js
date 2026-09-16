const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

// GET /api/categories
const getCategories = asyncHandler(async (req, res) => {
  const [categories] = await pool.query('SELECT * FROM categories ORDER BY parent_id, name');
  res.json(categories);
});

// POST /api/categories (admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, parent_id, description, image } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const [result] = await pool.query('INSERT INTO categories (name, slug, parent_id, description, image) VALUES (?,?,?,?,?)',
    [name, slug, parent_id || null, description || null, image || null]);
  res.status(201).json({ message: 'Category created', id: result.insertId });
});

// PUT /api/categories/:id (admin)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  await pool.query('UPDATE categories SET name=?, description=?, image=? WHERE id=?', [name, description, image, req.params.id]);
  res.json({ message: 'Category updated' });
});

// DELETE /api/categories/:id (admin)
const deleteCategory = asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
  res.json({ message: 'Category deleted' });
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
