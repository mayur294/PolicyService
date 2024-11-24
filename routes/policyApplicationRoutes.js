const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const { verifyPayment } = require('../controller/paymentController');
const validateRequest = require('../middleware/validateRequest');

const policyApplicationController = require('../controller/policyApplicationController');

// Route to apply for a policy
router.get('/applied',authenticateToken,policyApplicationController.getAppliedPolicies);
router.get('/:policyId', authenticateToken, policyApplicationController.getPolicyById);
router.get('/', authenticateToken, policyApplicationController.getAllPolicies);
router.post('/apply/:policyId', authenticateToken, validateRequest(['paymentAmount']), policyApplicationController.applyForPolicy);
router.patch('/cancel/:policyId', authenticateToken, policyApplicationController.cancelPolicyApplication);
router.patch('/renew/:policyId', authenticateToken, policyApplicationController.renewPolicy);
router.post('/verify-payment', authenticateToken, validateRequest(['token']), verifyPayment);
module.exports = router;
