// routes/foundRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const {
  createFound,
  getFound,
  getFoundById,
  updateFound,
  deleteFound,
  markAsReturned,
} = require('../controllers/foundController');

// Public
router.get('/',    optionalAuth, getFound);
router.get('/:id', optionalAuth, getFoundById);

// Protected
router.post('/',                  authMiddleware, upload.array('images', 5), createFound);
router.put('/:id',                authMiddleware, upload.array('images', 5), updateFound);
router.delete('/:id',             authMiddleware, deleteFound);
router.put('/:id/mark-returned',  authMiddleware, markAsReturned);

module.exports = router;
