const mongoose = require('mongoose');


const VerificationSchema = new mongoose.Schema({
itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
itemType: { type: String, enum: ['lost', 'found'], required: true },
proof: { type: String }, // url to image or text proof
question: { type: String },
answer: { type: String },
verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });


module.exports = mongoose.model('Verification', VerificationSchema);