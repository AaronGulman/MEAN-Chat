const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');

module.exports = (db) => {
  router.post('/login', (req, res) => authController.login(req, res, db));
  router.post('/register', (req, res) => authController.register(req, res, db));
  return router;
};
