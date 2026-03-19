// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require('../controllers/userController');

// All user management routes require login + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/',          getAllUsers);
router.get('/:id',       getUserById);
router.put('/:id/role',  updateUserRole);
router.delete('/:id',    deleteUser);

module.exports = router;
