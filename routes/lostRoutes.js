// routes/lostRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const { authMiddleware, optionalAuth } = require('../middleware/authMiddleware');
const {
  createLost,
  getLost,
  getLostById,
  updateLost,
  deleteLost,
  markAsReturned,
} = require('../controllers/lostController');

// Public — guests can browse; optionalAuth attaches user if logged in
router.get('/',    optionalAuth, getLost);
router.get('/:id', optionalAuth, getLostById);

// Protected — must be logged in
router.post('/',                  authMiddleware, upload.array('images', 5), createLost);
router.put('/:id',                authMiddleware, upload.array('images', 5), updateLost);
router.delete('/:id',             authMiddleware, deleteLost);
router.put('/:id/mark-returned',  authMiddleware, markAsReturned);

module.exports = router;
