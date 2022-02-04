const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserDB = require('../models/users');

// UserDB.find({}).select('email -_id')

const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

exports.register = (req, res, next) => {

    UserDB.find({ email: req.body.email.toLowerCase() })
        .exec()
        .then(user => {
            if (user.length != 0) {
                return res.status(409).json({
                    message: "Email sudah terdaftar."
                });
            }
            else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    }
                    else {
                        const user = new UserDB({
                            _id: new mongoose.Types.ObjectId(),
                            name: req.body.name,
                            email: req.body.email.toLowerCase(),
                            password: hash,
                            phoneNumber: req.body.phoneNumber
                        });
                        user
                            .save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'User telah dibuat.',
                                    request: {
                                        method: 'POST',
                                        url: 'http://localhost:2030/user/login',
                                        body: {
                                            email: 'String',
                                            password: 'String'
                                        }
                                    }
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });
                    };
                });
            }
        })

}

exports.login = (req, res, next) => {

    UserDB.find({ email: req.body.email.toLowerCase() })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Authorization Fail'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Authorization Fail'
                    });
                }
                if (result) {
                    const token = jwt.sign(
                        {
                            id: user[0]._id
                        },
                        'secret',
                        {
                            expiresIn: "15m"
                        }
                    );
                    return res.status(200).json({
                        message: 'Found',
                        token: token
                    });
                }
                res.status(401).json({
                    message: 'Authorization Fail'
                });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

}

exports.session = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    if (token) {
        jwt.verify(token, 'secret', (error, result) => {
            if (result) {
                return res.status(200).json({
                    message: 'Authorized'
                });
            }
            if (error) {
                return res.status(401).json({
                    message: 'Unauthorized'
                });
            }
            return res.status(401).json({
                message: 'Unauthorized'
            });
        });
    }
    else {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }
}

exports.profile = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    UserDB.find({ _id: decoded.id })
        .exec()
        .then(result => {
            res.status(200).json({
                    email: result[0].email,
                    name: result[0].name,
                    phoneNumber: result[0].phoneNumber
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

}

exports.delete = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);

    UserDB.remove({ _id: decoded.id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Your Data has been deleted.",
                request: {
                    method: 'POST',
                    url: 'http://localhost:2030/user/signup',
                    body: {
                        name: 'String', email: 'String', password: 'String', phoneNumber: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

}

exports.changeprofile = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    const newUpdate = { name: req.body.name, email: req.body.email, phoneNumber: req.body.phoneNumber };

    UserDB.find({ _id: decoded.id })
        .exec()
        .then(main => {
            UserDB.find({ email: req.body.email })
                .exec()
                .then(result => {
                    if (result[0] && req.body.email != main[0].email) {
                        return res.status(409).json({
                            message: 'Email sudah terdaftar.'
                        });
                    }
                    else if (result[0] && req.body.email == main[0].email || !result[0]) {
                        UserDB.find({ phoneNumber: req.body.phoneNumber })
                            .exec()
                            .then(resultph => {
                                if (resultph[0] && req.body.phoneNumber != main[0].phoneNumber) {
                                    return res.status(409).json({
                                        message: 'No HP sudah terdaftar.'
                                    });
                                }
                                else if (resultph[0] && req.body.phoneNumber == main[0].phoneNumber || !resultph[0]) {
                                    UserDB.update({ _id: decoded.id }, newUpdate)
                                        .exec()
                                        .then(updated => {
                                            res.status(200).json({
                                                message: 'Data Updated.'
                                            });
                                        })
                                }
                            })

                    }
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

}

exports.changepassword = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);

    UserDB.find({ _id: decoded.id })
        .exec()
        .then(result => {
            bcrypt.compare(req.body.password, result[0].password, (err, result2) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Current Password Wrong'
                    });
                }
                if (result2) {
                    bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                        if (err) {
                            return res.status(500).json({
                                error: err
                            });
                        }
                        else {
                            UserDB.update({ _id: decoded.id }, { password: hash })
                                .exec()
                                .then(updated => {
                                    res.status(200).json({
                                        message: 'Password telah diubah.'
                                    });
                                })
                        }
                    })
                }
                else {
                    return res.status(401).json({
                        message: 'Current Password Wrong'
                    });
                };
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });

}