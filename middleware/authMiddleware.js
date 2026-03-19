// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// 🔒 Required auth — blocks request if no valid token
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Unauthorized: No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

// 🔓 Optional auth — attaches user if token present, continues either way
// Use on GET routes that are public but should show owner controls when logged in
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // ignore invalid token on public routes
    }
  }
  next();
};

// 🛡️ Admin-only guard — use after authMiddleware
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  next();
};

module.exports = { authMiddleware, optionalAuth, adminMiddleware };
