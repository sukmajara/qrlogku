const express = require('express');
const router = express.Router();

const verifyPinUser = require('../middleware/verifyPinUser');

const MobileController = require('../controllers/c_mobile');

//mobile scan register QR
router.post('/register', verifyPinUser, MobileController.register);

//mobile scan login qr
router.post('/login', verifyPinUser, MobileController.login);

//mobile get info session on home UI
router.get('/home', verifyPinUser, MobileController.home);

//terminate session 
router.delete('/terminate', verifyPinUser, MobileController.terminate);

// list history login on client website
router.get('/history/:clientId', verifyPinUser, MobileController.history);

module.exports = router;
