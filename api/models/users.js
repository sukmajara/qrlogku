const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: { type: Number, required: true },
    userPin: { type: Number },
    isVerified: {type: Boolean},
    emailToken: {type: String}
});

module.exports = mongoose.model('UserDB', userSchema);