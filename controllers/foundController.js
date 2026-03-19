// controllers/foundController.js
const FoundItem = require('../models/FoundItem');
const { cloudinary } = require('../config/cloudinary');
const { removeLocalFile } = require('../utils/cleanupUpload');

// POST /api/found-items  (auth required)
async function createFound(req, res, next) {
  try {
    const { title, description, locationFound, dateFound, contactInfo } = req.body;
    const images = [];

    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'back-trackers/found',
        });
        images.push(result.secure_url);
        removeLocalFile(file.path);
      }
    }

    const item = await FoundItem.create({
      title,
      description,
      locationFound,
      dateFound,
      contactInfo,
      images,
      foundBy: req.user.id,   // ✅ link to logged-in user
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// GET /api/found-items  (public)
async function getFound(req, res, next) {
  try {
    const { q, location, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (location) filter.locationFound = new RegExp(location, 'i');
    if (status) filter.status = status;

    const items = await FoundItem.find(filter)
      .populate('foundBy', 'username')    // ✅ include poster username
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// GET /api/found-items/:id  (public)
async function getFoundById(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id).populate('foundBy', 'username');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// PUT /api/found-items/:id  (auth required, owner or admin)
async function updateFound(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isOwner = item.foundBy && String(item.foundBy) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner)
      return res.status(403).json({ message: 'Not authorised to edit this item' });

    const updates = req.body;
    if (req.files && req.files.length) {
      updates.images = item.images || [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'back-trackers/found' });
        updates.images.push(result.secure_url);
        removeLocalFile(file.path);
      }
    }

    const updated = await FoundItem.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/found-items/:id  (auth required, owner or admin)
async function deleteFound(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isOwner = item.foundBy && String(item.foundBy) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner)
      return res.status(403).json({ message: 'Not authorised to delete this item' });

    await item.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// PUT /api/found-items/:id/mark-returned  (auth required, owner or admin)
async function markAsReturned(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    const isOwner = item.foundBy && String(item.foundBy) === String(req.user.id);
    if (req.user.role !== 'admin' && !isOwner)
      return res.status(403).json({ message: 'Not authorised' });

    item.status = 'returned';
    await item.save();
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { createFound, getFound, getFoundById, updateFound, deleteFound, markAsReturned };
