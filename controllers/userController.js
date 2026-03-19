// controllers/userController.js
const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

// GET /api/users  (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/users/:id  (admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/:id/role  (admin only)
// Body: { "role": "admin" } or { "role": "user" }
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Role must be "user" or "admin"' });

    // Prevent admin from demoting themselves
    if (String(req.params.id) === String(req.user.id))
      return res.status(400).json({ message: 'You cannot change your own role' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `Role updated to ${role}`, user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/:id  (admin only)
// Also deletes all their lost/found posts
exports.deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.id))
      return res.status(400).json({ message: 'You cannot delete your own account here' });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clean up their posts
    await LostItem.deleteMany({ reportedBy: req.params.id });
    await FoundItem.deleteMany({ foundBy: req.params.id });
    await user.deleteOne();

    res.json({ message: 'User and their posts deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
