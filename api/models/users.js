const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    userPin: { type: Number, required: true },
    isVerified: { type: Boolean },
    emailToken: { type: String },
    pinCorrect: { type: Boolean }
});

module.exports = mongoose.model('UserDB', userSchema);