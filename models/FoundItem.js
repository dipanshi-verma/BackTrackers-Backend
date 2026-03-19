// models/FoundItem.js
const mongoose = require('mongoose');

const FoundItemSchema = new mongoose.Schema({
  title:         { type: String, required: true },
  description:   { type: String },
  locationFound: { type: String },
  dateFound:     { type: Date },
  contactInfo:   { type: String },                        // ✅ added — sent from frontend form
  images:        [{ type: String }],
  foundBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['found', 'matched', 'returned'],
    default: 'found',
  },
  verification: { type: mongoose.Schema.Types.ObjectId, ref: 'Verification' },
  metadata:     { type: Object },
}, { timestamps: true });

// Text index for search
FoundItemSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('FoundItem', FoundItemSchema);
