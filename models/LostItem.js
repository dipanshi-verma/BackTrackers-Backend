const mongoose = require('mongoose');


const LostItemSchema = new mongoose.Schema({
title: { type: String, required: true },
description: { type: String },
location: { type: String },
dateLost: { type: Date },
images: [{ type: String }], 
reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
status: {
type: String,
enum: ['lost', 'claimed', 'returned'],
default: 'lost',
},
verification: { type: mongoose.Schema.Types.ObjectId, ref: 'Verification' },
metadata: { type: Object },
}, { timestamps: true });


module.exports = mongoose.model('LostItem', LostItemSchema);