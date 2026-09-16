const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { asyncHandler } = require('../middleware/error');

const generateToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
    [name, email, hashed, phone || null]
  );

  const user = { id: result.insertId, name, email, role: 'customer' };
  res.status(201).json({ message: 'Account created', token: generateToken(user), user });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  const { password: _, ...userData } = user;
  res.json({ token: generateToken(user), user: userData });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, phone, role, avatar, created_at FROM users WHERE id = ?', [req.user.id]);
  if (!rows[0]) return res.status(404).json({ message: 'User not found' });
  res.json(rows[0]);
});

// PUT /api/auth/me
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  await pool.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name, phone, req.user.id]);
  res.json({ message: 'Profile updated' });
});

// PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(currentPassword, rows[0].password)))
    return res.status(400).json({ message: 'Current password incorrect' });

  const hashed = await bcrypt.hash(newPassword, 10);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
  res.json({ message: 'Password changed' });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
