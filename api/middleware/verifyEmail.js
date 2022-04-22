const UserDB = require('../models/users');

const verifyEmail = async (req, res, next) => {

    try {
        const user = await UserDB.findOne({ email: req.body.email })
        if (!user) {
            next()
        }
        else if (user.isVerified) {
            next()
        }
        else {
            return res.status(401).json({
                message: "Your Email is not verified. Please Verify your Email Address."
            })
        }
    }
    catch (err) {
        console.log(err)
    }

}

module.exports = verifyEmail;