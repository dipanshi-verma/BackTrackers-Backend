// controllers/lostController.js
const LostItem = require('../models/LostItem');
const { cloudinary } = require('../config/cloudinary');
const { removeLocalFile } = require('../utils/cleanupUpload');

// POST /api/lost-items  (auth required)
async function createLost(req, res, next) {
  try {
    const { title, description, location, dateLost, contactInfo } = req.body;
    const images = [];

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'back-trackers/lost',
        });
        images.push(result.secure_url);
        removeLocalFile(file.path);
      }
    }

    const item = await LostItem.create({
      title,
      description,
      location,
      dateLost,
      contactInfo,
      images,
      reportedBy: req.user.id,   // ✅ link to logged-in user
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// GET /api/lost-items  (public, optionalAuth populates req.user)
async function getLost(req, res, next) {
  try {
    const { q, location, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (location) filter.location = new RegExp(location, 'i');
    if (status) filter.status = status;

    const items = await LostItem.find(filter)
      .populate('reportedBy', 'username')   // ✅ include poster username
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// GET /api/lost-items/:id  (public)
async function getLostById(req, res, next) {
  try {
    const item = await LostItem.findById(req.params.id).populate('reportedBy', 'username');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// PUT /api/lost-items/:id  (auth required, owner or admin)
async function updateLost(req, res, next) {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    // ✅ ownership check
    if (req.user.role !== 'admin' && String(item.reportedBy) !== String(req.user.id))
      return res.status(403).json({ message: 'Not authorised to edit this item' });

    const updates = req.body;
    if (req.files && req.files.length) {
      updates.images = item.images || [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'back-trackers/lost' });
        updates.images.push(result.secure_url);
        removeLocalFile(file.path);
      }
    }

    const updated = await LostItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/lost-items/:id  (auth required, owner or admin)
async function deleteLost(req, res, next) {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    // ✅ ownership check
    if (req.user.role !== 'admin' && String(item.reportedBy) !== String(req.user.id))
      return res.status(403).json({ message: 'Not authorised to delete this item' });

    await item.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/lost-items/:id/mark-returned  (auth required, owner or admin)
async function markAsReturned(req, res, next) {
  try {
    const item = await LostItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'admin' && String(item.reportedBy) !== String(req.user.id))
      return res.status(403).json({ message: 'Not authorised' });

    item.status = 'returned';
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { createLost, getLost, getLostById, updateLost, deleteLost, markAsReturned };
