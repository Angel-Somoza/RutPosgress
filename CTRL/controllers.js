const express = require('express');
const authController = require('../Logic/login_controller');

const router = express.Router();

router.post('/login', authController.login.bind(authController));

module.exports = router;