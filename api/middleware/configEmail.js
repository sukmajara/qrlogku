const nodemailer = require('nodemailer')

var emailVerification = nodemailer.createTransport({
    service: "gmail",
    auth: {
        //https://myaccount.google.com/lesssecureapps
        user: 'cs.qrlogku@gmail.com',
        pass: "qrlogku123!@#"
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = emailVerification;