// routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, adminLogin, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register',    registerUser);
router.post('/login',       loginUser);
router.post('/admin-login', adminLogin);
router.get('/me',           authMiddleware, getMe);   // refresh user info

module.exports = router;
