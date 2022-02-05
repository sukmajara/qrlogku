const mongoose = require('mongoose');
const randomstring = require("randomstring");
const qrcode = require("qrcode");

const ClientDB = require('../models/clients');
const AuthDB = require('../models/auths');

exports.register = (req, res, next) => {
    ClientDB.find({ auth: req.body.auth })
        .exec()
        .then(result => {
            if (result[0] != null) {
                ClientDB.update({ auth: req.body.auth }, { register: 1, auth: '' }).exec()
                res.status(200).json({
                    message: 'Found.',
                    id: result[0].id,
                    clientId: result[0].clientId
                })
            }
            else {
                res.status(404).json({
                    message: 'Not Found.'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });
};

exports.login = (req, res, next) => {
    AuthDB.find({ auth: req.body.auth })
        .exec()
        .then(result => {
            if (result[0] != null) {
                ClientDB.update({ clientId: result[0].clientId }, { status: 'Active', deviceId: randomstring.generate() }).exec() 
                res.status(200).json({
                    message: "Found.",
                    id: result[0].id,
                    clientId: result[0].clientId
                });
            }
            else {
                res.status(404).json({
                    message: 'Not Found.'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });
};

exports.generate = (req, res, next) => {
    const generate = randomstring.generate() + '/' + req.body.clientInfo
    qrcode.toDataURL(generate)
        .then(result => {
            res.status(200).json({
                qr: result,
                string: generate
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });
}

exports.session = (req, res, next) => {

    AuthDB.find({ auth: req.body.auth })
        .exec()
        .then(check => {
            if (!check[0]) {
                return res.status(404).json({
                    message: 'Not Active'
                });
            }
            return res.status(200).json({
                message: 'Active'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.logout = (req, res, next) => {

    AuthDB.find({ auth: req.body.auth })
        .exec()
        .then(check => {
            if (!check[0]) {
                return res.status(500).json({
                    message: "Internal Server Error."
                })
            }
            AuthDB.remove({ auth: req.body.auth })
                .exec()
                .then(result => {
                    if (result.deletedCount == 0) {
                        return res.status(404).json({
                            message: 'Not Found.'
                        });
                    }
                    res.status(200).json({
                        message: 'Session was deleted.'
                    })
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: "Internal Server Error."
            });
        });

}