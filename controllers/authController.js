// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
exports.registerUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password are required' });

    const userExists = await User.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: 'Username already taken' });

    // ✅ NEVER accept role from the request body — always default to 'user'
    const user = await User.create({ username, password, role: 'user' });

    res.status(201).json({
      message: 'Registered successfully',
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// POST /api/auth/admin-login
// Requires username + password + adminCode (set in .env as ADMIN_SECRET_CODE)
exports.adminLogin = async (req, res) => {
  const { username, password, adminCode } = req.body;
  try {
    // 1. Check secret code first — fail fast, don't reveal whether user exists
    if (!adminCode || adminCode !== process.env.ADMIN_SECRET_CODE)
      return res.status(403).json({ message: 'Invalid admin code' });

    // 2. Find user
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    // 3. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // 4. Must actually be an admin
    if (user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied: not an admin account' });

    const token = generateToken(user._id, user.role);
    res.status(200).json({
      message: 'Admin login successful',
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// GET /api/auth/me  (used to refresh user info from token)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
