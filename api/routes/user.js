const express = require('express');
const router = express.Router();

const UserController = require('../controllers/c_user');
const verifyEmail  = require('../middleware/verifyEmail')

//register 
router.post('/register', UserController.register);

//verify email
router.get('/verifyEmail', UserController.verifyEmail);

//login
router.post('/login', verifyEmail ,UserController.login);

//check Session User
router.get('/session', UserController.session);

//get profile
router.get('/profile', UserController.profile);

//delete account
router.delete('/delete', UserController.delete);

//change profile
router.patch('/changeprofile', UserController.changeprofile);

//change password
router.patch('/changepassword', UserController.changepassword);

//create PIN
router.patch('/createpin', UserController.createPin);

//validate PIN
router.post('/validatepin', UserController.validatePin);

//change PIN
router.patch('/changepin', UserController.changePin);

module.exports = router;