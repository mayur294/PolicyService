// routes/authRoutes.js
const express = require('express');
const authController = require('../controller/authController');

const router = express.Router();

// User Registration Route
router.post('/register', authController.registerUser);

// User Login Route
router.post('/login', authController.loginUser);

// Logout the user
// router.post('/logout', authController.logoutUser);

module.exports = router;
