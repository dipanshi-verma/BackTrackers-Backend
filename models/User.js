const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
name: String,
email: { type: String, unique: true, sparse: true },
phone: String,
isAdmin: { type: Boolean, default: false },
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);