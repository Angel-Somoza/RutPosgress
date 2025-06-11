const express = require('express');
const authController = require('../Logic/login_controller');

const router = express.Router();
//endpoint Post para el login
router.post('/login', authController.login.bind(authController));
//endpoint Post para el register
router.post('/register', authController.register);


module.exports = router;