const express = require('express');
const router = express.Router();

const ClientController = require('../controllers/c_client');

//web register ask api
router.post('/register', ClientController.register);

//web login ask api 
router.post('/login', ClientController.login);

//generate qr
router.post('/generate', ClientController.generate);

//ask clientid manage session
router.post('/session', ClientController.session );

//logout website
router.delete('/terminate', ClientController.logout);


module.exports = router;