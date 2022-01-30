const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    auth: { type: String, required: true },
    id: { type: String, required: true },
    clientInfo: { type: String, required: true },
    clientId: { type: String, required: true },
    // loginDate: { type: String },
    status: { type: String }
});

module.exports = mongoose.model('ClientDB', clientSchema);