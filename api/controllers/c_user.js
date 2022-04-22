const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { passwordStrength } = require('check-password-strength')
const crypto = require('crypto')

const UserDB = require('../models/users');
const emailVerification = require('../middleware/configEmail')

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
                const userPasswordStrength = passwordStrength(req.body.password).value

                if (userPasswordStrength == 'Too weak') {
                    return res.status(400).json({
                        message: "Password Sangat lemah"
                    })
                }
                if (userPasswordStrength == 'Weak') {
                    return res.status(400).json({
                        message: "Password lemah"
                    })
                }

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
                            phoneNumber: req.body.phoneNumber,
                            userPin: '',
                            isVerified: false,
                            emailToken: crypto.randomBytes(64).toString('hex')
                        });
                        user
                            .save()
                            .then(result => {
                                var mailFormat = {
                                    from: ' "Verify your email" <hokisaya999@gmail.com>',
                                    to: result.email,
                                    subject: "Verification Email QRLogku",
                                    html: `<h2> Welcome ${result.name}! Thanks for Registering Account on QRLogku </h2>
                                    <h4> Please verify your mail to login on QRLogku </h4>
                                    <a href="http://${req.headers.host}/user/verifyEmail?token=${result.emailToken}">Click to Verify Your Email!</a>`
                                }

                                emailVerification.sendMail(mailFormat, function (error, info) {
                                    if (error) {
                                        console.log(error)
                                    }
                                    else {
                                        res.status(201).json({
                                            message: 'User telah dibuat, Please Verification your email.',
                                        });
                                    }
                                })
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error: "Internal Server Error."
                                });
                            });
                    };
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: "Internal Server Error."
            });
        });

}

exports.verifyEmail = (req, res, next) => {

    const token = req.query.token
    const newUpdate = { emailToken: null, isVerified: true }

    UserDB.find({ emailToken: token })
        .then(user => {
            if (user[0]) {
                UserDB.update({ emailToken: token }, newUpdate)
                    .exec()
                    .then(result => {
                        return res.status(200).json({
                            message: "Your Account Successfully Verified , Please Login on Mobile Application QRLogku."
                        })
                    })
            }
            else {
                return res.status(401).json({
                    message: "Link Expired."
                })
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: "Internal Server Error."
            });
        });

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
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.session = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

    UserDB.find({ id: decoded.id })
        .exec()
        .then(validation => {
            if (!validation[0]) {
                return res.status(401).json({
                    message: 'Unauthorized'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });

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
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

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
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.delete = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

    UserDB.remove({ _id: decoded.id })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Your Data has been deleted.",
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.changeprofile = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

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
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.changepassword = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

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
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.createPin = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

    if (req.body.userPin.length != 6) {
        return res.status(400).json({
            message: 'Bad Request.'
        })
    }

    UserDB.find({ _id: decoded.id, userPin: req.body.userPin })
        .exec()
        .then(validation => {
            if (validation) {
                return res.status(409).json({
                    message: 'Youre already create PIN.'
                });
            }
            UserDB.update({ _id: decoded.id }, { userPin: req.body.userPin })
                .exec()
                .then(updated => {
                    res.status(200).json({
                        message: 'Success.'
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });

}

exports.validatePin = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

    if (req.body.userPin.length != 6) {
        return res.status(400).json({
            message: 'Bad Request.'
        })
    }

    UserDB.find({ _id: decoded.id, userPin: req.body.userPin })
        .exec()
        .then(result => {
            if (!result[0]) {
                return res.status(401).json({
                    message: 'Wrong PIN.'
                });
            }
            res.status(200).json({
                message: 'Success.'
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });
}

exports.changePin = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    if (!token) {
        return res.status(401).json({
            message: 'JWT Required.'
        })
    }

    if (req.body.currentUserPin.length != 6) {
        return res.status(400).json({
            message: 'Bad Request.'
        })
    }

    else if (req.body.newUserPin.length != 6) {
        return res.status(400).json({
            message: 'Bad Request.'
        })
    }

    else if (req.body.currentUserPin == req.body.newUserPin) {
        return res.status(400).json({
            message: 'Your new PIN is same with your current PIN.'
        })
    }

    UserDB.find({ _id: decoded.id, userPin: req.body.currentUserPin })
        .exec()
        .then(result => {
            if (!result[0]) {
                return res.status(401).json({
                    message: 'Wrong PIN.'
                });
            }
            UserDB.update({ _id: decoded.id }, { userPin: req.body.newUserPin })
                .exec()
                .then(updated => {
                    res.status(200).json({
                        message: 'Success.'
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error." });
        });

}

