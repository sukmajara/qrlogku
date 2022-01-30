const express = require('express');
const router = express.Router();

const UserController = require('../controllers/c_user');

//register 
router.post('/register', UserController.register);

//login
router.post('/login', UserController.login);

router.get('/session', UserController.session);

//get profile
router.get('/profile', UserController.profile);

//delete account
router.delete('/delete', UserController.delete);

//change profile
router.patch('/changeprofile', UserController.changeprofile);

//change password
router.patch('/changepassword', UserController.changepassword);

module.exports = router;