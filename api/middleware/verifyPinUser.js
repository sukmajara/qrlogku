const jwt = require('jsonwebtoken');
const UserDB = require('../models/users');

const verifyPinUser = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.decode(token);
    try {
        const user = await UserDB.findOne({ _id: decoded.id })
        if (!user) {
            next()
        }
        else if (user.pinCorrect) {
            next()
        }
        else {
            return res.status(401).json({
                message: "Please Input your PIN!"
            })
        }
    }
    catch (err) {
        console.log(err)
    }

}

module.exports = verifyPinUser;