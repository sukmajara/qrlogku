const express = require('express');
const router = express.Router();

const UserController = require('../controllers/c_user');
const verifyEmail = require('../middleware/verifyEmail');
const verifyPinUser = require('../middleware/verifyPinUser');

//register 
router.post('/register', UserController.register);

//verify email
router.get('/verifyEmail', UserController.verifyEmail);

//login
router.post('/login', verifyEmail, UserController.login);

//check Session User
router.get('/session', UserController.session);

//get profile
router.get('/profile', verifyPinUser, UserController.profile);

//delete account
router.delete('/delete', verifyPinUser, UserController.delete);

//change profile
router.patch('/changeprofile', verifyPinUser, UserController.changeprofile);

//change password
router.patch('/changepassword', verifyPinUser, UserController.changepassword);

//create PIN
// router.post('/createpin', UserController.createPin);

//validate PIN
router.post('/validatepin', UserController.validatePin);

//change PIN
router.patch('/changepin', verifyPinUser, UserController.changePin);

module.exports = router;