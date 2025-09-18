const FoundItem = require('../models/FoundItem');
const Verification = require('../models/Verification');
const { cloudinary } = require('../config/cloudinary');
const { removeLocalFile } = require('../utils/cleanupUpload');


async function createFound(req, res, next) {
try {
const { title, description, locationFound, dateFound } = req.body;
const images = [];


if (req.files && req.files.length) {
for (const file of req.files) {
const result = await cloudinary.uploader.upload(file.path, { folder: 'back-trackers/found' });
images.push(result.secure_url);
removeLocalFile(file.path);
}
}


const item = await FoundItem.create({ title, description, locationFound, dateFound, images });
res.status(201).json(item);
} catch (err) { next(err); }
}


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


res.json(item