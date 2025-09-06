// Load environment variables from .env file at the very beginning
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Import new middleware and controllers
const authMiddleware = require('./middleware/authMiddleware');
const authController = require('./controllers/authController');

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports JPEG, JPG, and PNG images.'));
    }
});

app.use('/uploads', express.static(uploadsDir));


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI) // The connection string is all that's needed
.then(() => console.log('MongoDB connected successfully!'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});


// --- Mongoose Schemas and Models (UNCHANGED) ---
const lostItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: 'No description provided.' },
    dateLost: { type: Date, default: Date.now },
    location: String,
    contactInfo: String,
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{ type: String }],
}, { timestamps: true });

const LostItem = mongoose.model('LostItem', lostItemSchema);

const foundItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: 'No description provided.' },
    dateFound: { type: Date, default: Date.now },
    locationFound: String,
    contactInfo: String,
    returnedToOwner: { type: Boolean, default: false },
    foundBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [{ type: String }],
}, { timestamps: true });

const FoundItem = mongoose.model('FoundItem', foundItemSchema);

// --- New Authentication Routes ---
app.post('/api/auth/register', authController.registerUser);
app.post('/api/auth/login', authController.loginUser);

// --- API Routes (Lost Items) ---
// GET route is public
app.get('/api/lost-items', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            query = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            };
        }
        const items = await LostItem.find(query).sort({ dateLost: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST, PUT, DELETE routes are now protected by authMiddleware
app.post('/api/lost-items', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, location, contactInfo } = req.body;
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const newLostItem = await LostItem.create({
            name,
            description,
            location,
            contactInfo,
            postedBy: req.user.id,
            images: imageUrls,
        });
        res.status(201).json(newLostItem);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/api/lost-items/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await LostItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        // Authorization check: User must be admin or the original poster
        if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only delete items you posted or if you are an admin.' });
        }
        item.images.forEach(imageUrl => {
            const imagePath = path.join(__dirname, imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        await LostItem.findByIdAndDelete(id);
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/lost-items/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, location, contactInfo, existingImages } = req.body;
        const item = await LostItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only edit items you posted or if you are an admin.' });
        }
        const existingImageUrls = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
        const oldImageUrlsToDelete = item.images.filter(img => !existingImageUrls.includes(img));
        oldImageUrlsToDelete.forEach(imageUrl => {
            const imagePath = path.join(__dirname, imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        const newImageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const updatedImages = [...existingImageUrls, ...newImageUrls];
        const updatedItem = await LostItem.findByIdAndUpdate(
            id,
            { name, description, location, contactInfo, images: updatedImages },
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/lost-items/:id/mark-found', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const lostItem = await LostItem.findById(id);
        if (!lostItem) {
            return res.status(404).json({ message: 'Lost item not found.' });
        }
        if (lostItem.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only mark items you posted or if you are an admin.' });
        }
        const newFoundItem = await FoundItem.create({
            name: lostItem.name,
            description: lostItem.description,
            dateFound: new Date(),
            locationFound: lostItem.location,
            contactInfo: lostItem.contactInfo,
            foundBy: req.user.id,
            returnedToOwner: true,
            images: lostItem.images
        });
        await LostItem.findByIdAndDelete(id);
        res.status(200).json({
            message: 'Lost item marked as found and moved successfully!',
            foundItem: newFoundItem
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- API Routes (Found Items) ---
// GET route is public
app.get('/api/found-items', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};
        if (q) {
            query = {
                $or: [
                    { name: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } }
                ]
            };
        }
        const items = await FoundItem.find(query).sort({ dateFound: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST, PUT, DELETE routes are now protected by authMiddleware
app.post('/api/found-items', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, locationFound, contactInfo, returnedToOwner } = req.body;
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const newFoundItem = await FoundItem.create({
            name,
            description,
            locationFound,
            contactInfo,
            returnedToOwner: returnedToOwner === 'true',
            foundBy: req.user.id,
            images: imageUrls,
        });
        res.status(201).json(newFoundItem);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.delete('/api/found-items/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const item = await FoundItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.foundBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only delete items you posted or if you are an admin.' });
        }
        item.images.forEach(imageUrl => {
            const imagePath = path.join(__dirname, imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        await FoundItem.findByIdAndDelete(id);
        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.put('/api/found-items/:id', authMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, locationFound, contactInfo, returnedToOwner, existingImages } = req.body;
        const item = await FoundItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
        }
        if (item.foundBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: You can only edit items you posted or if you are an admin.' });
        }
        const existingImageUrls = existingImages ? (Array.isArray(existingImages) ? existingImages : [existingImages]) : [];
        const oldImageUrlsToDelete = item.images.filter(img => !existingImageUrls.includes(img));
        oldImageUrlsToDelete.forEach(imageUrl => {
            const imagePath = path.join(__dirname, imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });
        const newImageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
        const updatedImages = [...existingImageUrls, ...newImageUrls];
        const updatedItem = await FoundItem.findByIdAndUpdate(
            id,
            { name, description, locationFound, contactInfo, returnedToOwner: returnedToOwner === 'true', images: updatedImages },
            { new: true, runValidators: true }
        );
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Attempting to connect to MongoDB using: ${process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : ' (URI not set)'}`);
});