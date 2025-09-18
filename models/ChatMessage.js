const mongoose = require('mongoose');


const ChatMessageSchema = new mongoose.Schema({
from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
message: { type: String },
anonymous: { type: Boolean, default: true },
room: { type: String },
}, { timestamps: true });


module.exports = mongoose.model('ChatMessage', ChatMessageSchema);