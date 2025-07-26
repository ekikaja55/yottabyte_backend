// src/routes/auth.js
// This file defines the routes for authentication-related functionality in the Yottabyte backend.

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
