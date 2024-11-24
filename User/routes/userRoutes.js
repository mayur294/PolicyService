const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const userController = require('../controller/userController');
const axios = require('axios');

// Fetch basic user info
router.get('/account/basic-info', authenticateToken, userController.getBasicInfo);
router.put('/account/update', authenticateToken, userController.updateUserInfo);
router.put('/:userId/update-policies', authenticateToken, userController.updateUserPolicies);
router.get('/:userId', authenticateToken, userController.getBasicInfo);
module.exports = router;