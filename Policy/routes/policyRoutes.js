 // routes/policyRoutes.js
const express = require('express');
 const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const policyController = require("../controller/policyController");

const router = express.Router();

// Admin-only routes
// Create a new policy (Admin only)
router.post('/', authenticateToken, authorizeAdmin, policyController.createPolicy);
// Update a policy by ID (Admin only)
router.put('/:id', authenticateToken, authorizeAdmin, policyController.updatePolicy);
// Delete a policy by ID (Admin only)
router.delete('/:id', authenticateToken, authorizeAdmin, policyController.deletePolicy);
// Activate a policy
router.patch('/:id/activate',authenticateToken, authorizeAdmin, policyController.activatePolicy);
// Deactivate a policy
router.patch('/:id/deactivate',authenticateToken, authorizeAdmin, policyController.deactivatePolicy);


module.exports = router;

