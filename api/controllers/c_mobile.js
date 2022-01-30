const mongoose = require('mongoose');
const randomstring = require("randomstring");
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const AuthDB = require('../models/auths');
const ClientDB = require('../models/clients');

exports.register = (req, res, next) => {

    if (req.body.auth.includes('bash') || req.body.auth.includes('php') || req.body.auth.includes('script')) {
        return res.status(500).json({
            message: 'Forbidden.'
        });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    const client = new ClientDB({
        _id: new mongoose.Types.ObjectId(),
        auth: req.body.auth,
        id: decoded.id,
        clientInfo: req.body.auth.split("/")[1],
        clientId: randomstring.generate(),
        status: 'Not Active',
        // loginDate: ' '
    });
    client
        .save()
        .then(result => {
            res.status(200).json({
                message: 'OK.',
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

}

exports.login = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);

    if (req.body.auth.includes('bash') || req.body.auth.includes('php') || req.body.auth.includes('script')) {
        return res.status(500).json({
            message: 'Forbidden.'
        });
    }

    ClientDB.find({ clientId: req.body.clientId }).select('clientId -_id')
        .exec()
        .then(client => {
            if (!client[0]) {
                return res.status(404).json({
                    message: 'Invalid clientId'
                });
            }

            // ClientDB.update({ clientId: req.body.clientId }, { loginDate: moment.tz('Asia/Jakarta'), status: 'Active' }).exec()
            const auth = new AuthDB({
                _id: new mongoose.Types.ObjectId(),
                auth: req.body.auth,
                id: decoded.id,
                clientInfo: req.body.auth.split("/")[1],
                clientId: req.body.clientId,
                deviceId: randomstring.generate()
            });
            auth
                .save()
                .then(result => {
                    ClientDB.update({ clientId: req.body.clientId }, { status: 'Active' }).exec()  
                    res.status(200).json({
                        message: 'OK.',
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

exports.home = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);

    ClientDB.find({ id: decoded.id }).select('clientInfo clientId status -_id')
        .exec()
        .then(result => {
            if (!result) {
                return res.status(404).json({
                    message: 'Not Found.'
                });
            }
            res.status(200).json({
                dataUser: result
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });

}

exports.terminate = (req, res, next) => {

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);

    AuthDB.find({ id: decoded.id, deviceId: req.body.deviceId })
        .exec()
        .then(check => {
            if (!check[0]) {
                return res.status(500).json({
                    message: 'Forbidden'
                })
            }
            AuthDB.remove({ deviceId: req.body.deviceId })
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
                error: err
            });
        });

}

exports.history = (req, res, next) =>{

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);

    AuthDB.find({id: decoded.id, clientId: req.params.clientId}, ('deviceId -_id'))
    .exec()
    .then(result => {
        // if(!result[0]){
        //     ClientDB.update({ clientId: req.params.clientId }, {status: 'Not Active' }).exec()
        //     return res.status(200).json({
        //         message: "History is Empty."
        //     });
        // }
        res.status(200).json({
            message: result
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    });

}

//change status to active or non active
// router.patch('/changestatus', (req, res, next) => {
//     const token = req.headers.authorization.split(" ")[1];
//     const decoded = jwt.decode(token);

//     ClientDB.find({ id: decoded.id, clientId: req.body.clientId })
//         .exec()
//         .then(check => {
//             console.log(check[0].status)
//             if (!check) {
//                 return res.status(500).json({
//                     message: 'Forbidden'
//                 })
//             }
//             if (req.body.status == 'Active' && check[0].status != 'Not Login' || req.body.status == 'Not Active' && check[0].status != 'Not Login') {
//                 ClientDB.update({ clientId: req.body.clientId }, { status: req.body.status })
//                     .exec()
//                     .then(result => {
//                         res.status(200).json({
//                             message: 'Session was updated.'
//                         })
//                     })
//             }
//             else {
//                 res.status(500).json({
//                     message: 'Forbidden.'
//                 })
//             }
//         })
//         .catch(err => {
//             console.log(err);
//             res.status(500).json({
//                 error: err
//             });
//         });
// });