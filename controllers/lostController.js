const LostItem = require('../models/LostItem');
const Verification = require('../models/Verification');
const { cloudinary } = require('../config/cloudinary');
const { removeLocalFile } = require('../utils/cleanupUpload');


async function createLost(req, res, next) {
try {
const { title, description, location, dateLost } = req.body;
const images = [];


if (req.files && req.files.length) {
for (const file of req.files) {
const result = await cloudinary.uploader.upload(file.path, { folder: 'back-trackers/lost' });
images.push(result.secure_url);
removeLocalFile(file.path);
}
}


const item = await LostItem.create({
title, description, location, dateLost, images
});


res.status(201).json(item);
} catch (err) {
next(err);
}
}


async function getLost(req, res, next) {
try {
const { q, location, status, page = 1, limit = 20 } = req.query;
const filter = {};
if (q) filter.$text = { $search: q };
if (location) filter.location = new RegExp(location, 'i');
if (status) filter.status = status;


const items = await LostItem.find(filter)
.skip((page - 1) * limit)
.limit(Number(limit))
.sort({ createdAt: -1 });


res.json(items);
} catch (err) { next(err); }
}


async function getLostById(req, res, next) {
try {
const item = await LostItem.findById(req.params.id);
if (!item) return res.status(404).json({ message: 'Not found' });
res.json(item);
} catch (err) { next(err); }
}


async function updateLost(req, res, next) {
try {
const updates = req.body;
if (req.files && req.files.length) {
updates.images = updates.images || [];
module.exports = { createLost, getLost, getLostById, updateLost, deleteLost, markAsReturned };