const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

// Define routes and associate them with controller functions
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
