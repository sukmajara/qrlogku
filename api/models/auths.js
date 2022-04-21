const mongoose = require('mongoose');

const AuthSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    auth: { type: String, required: true },
    id: { type: String, required: true },
    clientInfo: { type: String, required: true },
    clientId: { type: String, required: true },
    deviceId: { type: String }
});

module.exports = mongoose.model('AuthDB', AuthSchema);