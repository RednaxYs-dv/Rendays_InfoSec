const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── Helper: Generate JWT ──────────────────────────────────────────────────────
const generateToken = (id) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this') {
    console.warn('[SECURITY WARNING] JWT_SECRET is using the default insecure value!');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Input Validators ─────────────────────────────────────────────────────────
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidUsername = (u) => /^[a-zA-Z0-9_]{3,30}$/.test(u);
const isStrongPassword = (p) => p && p.length >= 8;

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'Please provide username, email, and password' });

    if (typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string')
      return res.status(400).json({ success: false, message: 'Invalid input types' });

    if (!isValidUsername(username))
      return res.status(400).json({ success: false, message: 'Username must be 3–30 chars: letters, numbers, underscores only' });

    if (!isValidEmail(email))
      return res.status(400).json({ success: false, message: 'Invalid email format' });

    if (!isStrongPassword(password))
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });

    const existingByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingByEmail)
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });

    const existingByUsername = await User.findOne({ username });
    if (existingByUsername)
      return res.status(400).json({ success: false, message: 'That username is already taken' });

    const user = new User({ username: username.trim(), email: email.toLowerCase().trim(), password });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Username or email already in use.' });
    console.error('Registration error:', error.name);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if ((!username && !email) || !password)
      return res.status(400).json({ success: false, message: 'Please provide credentials' });

    if ((username && typeof username !== 'string') || (email && typeof email !== 'string') || typeof password !== 'string')
      return res.status(400).json({ success: false, message: 'Invalid input types' });

    const query = email ? { email: email.toLowerCase().trim() } : { username: username.trim() };
    const user = await User.findOne(query);

    // Always run bcrypt.compare to prevent timing attacks
    const dummyHash = '$2a$10$abcdefghijklmnopqrstuuVnrKMfhZ5VaJRvtEYlQBbLYj9l7Mj.K';
    const isMatch = await bcrypt.compare(password, user ? user.password : dummyHash);

    if (!user || !isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.status(200).json({
      success: true,
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Login error:', error.name);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

module.exports = router;
