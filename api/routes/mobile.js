const express = require('express');
const router = express.Router();

const MobileController = require('../controllers/c_mobile');

//mobile scan register QR
router.post('/register', MobileController.register );

//mobile scan login qr
router.post('/login', MobileController.login);

//mobile get info session on home UI
router.get('/home', MobileController.home);

//terminate session 
router.delete('/terminate', MobileController.terminate);

// list history login on client website
router.get('/history/:clientId' , MobileController.history);

module.exports = router;
