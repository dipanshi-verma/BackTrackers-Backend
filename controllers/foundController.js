const FoundItem = require('../models/FoundItem');
const Verification = require('../models/Verification');
const { cloudinary } = require('../config/cloudinary');
const { removeLocalFile } = require('../utils/cleanupUpload');

// 📌 Create Found Item
async function createFound(req, res, next) {
  try {
    const { title, description, locationFound, dateFound } = req.body;
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
      images,
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// 📌 Get all Found Items
async function getFound(req, res, next) {
  try {
    const { q, location, status, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) filter.$text = { $search: q };
    if (location) filter.locationFound = new RegExp(location, 'i');
    if (status) filter.status = status;

    const items = await FoundItem.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    next(err);
  }
}

// 📌 Get Found Item by ID
async function getFoundById(req, res, next) {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// 📌 Update Found Item
async function updateFound(req, res, next) {
  try {
    const updates = req.body;

    if (req.files && req.files.length) {
      updates.images = updates.images || [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'back-trackers/found',
        });
        updates.images.push(result.secure_url);
        removeLocalFile(file.path);
      }
    }

    const item = await FoundItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// 📌 Delete Found Item
async function deleteFound(req, res, next) {
  try {
    const item = await FoundItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// 📌 Mark Found Item as Returned
async function markAsReturned(req, res, next) {
  try {
    const item = await FoundItem.findByIdAndUpdate(
      req.params.id,
      { status: 'returned' },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createFound,
  getFound,
  getFoundById,
  updateFound,
  deleteFound,
  markAsReturned,
};
