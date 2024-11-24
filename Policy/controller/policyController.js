  
const mongoose = require('mongoose');
const Policy = require("../models/Policy");
const PolicyApplication = require('../models/PolicyApplication');
const { ObjectId } = require('mongoose').Types;

// User-service base URL
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:5000';

// Utility functions
const { 
    getPolicy, 
    validateRenewalWindow, 
    validatePaymentAmount 
} = require('../utility/policyUtils');

// Create a new policy - Admin only
exports.createPolicy = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        const policy = new Policy(req.body);
        await policy.save();
        res.status(201).json(policy);
    } catch (error) {
        console.error('Error creating policy:', error);
        res.status(400).json({ message: `Error creating policy: ${error.message}` });
    }
};
// Update a policy by ID - Admin only
exports.updatePolicy = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!policy) return res.status(404).json({ message: "Policy not found" });
        res.json(policy);
    } catch (error) {
        console.error('Error updating policy:', error);
        res.status(400).json({ message: `Error updating policy: ${error.message}` });
    }
};
// Delete a policy by ID - Admin only
exports.deletePolicy = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }
        const policyId= (req.params.id);
       // policyId = new mongoose.Types.ObjectId(policyId);

        const application = await PolicyApplication.find({ policyId: policyId });
        
        if (application && application.length > 0) {
            return res.status(403).json({
                error: "Policy cannot be deleted because there are active applications associated with it.",
                totalApplications: application.length
            });
        }
//                console.log("user aplied",policyId,application.length)

       const policy = await Policy.findByIdAndDelete(req.params.id);

        if (!policy) return res.status(404).json({ message: "Policy not found" });
        res.json({ message: "Policy deleted successfully" });
    } catch (error) {
        console.error('Error deleting policy:', error);
        res.status(500).json({ message: `Error deleting policy: ${error.message}` });
    }
};
// Activate a policy - Admin only
exports.activatePolicy = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        const policy = await Policy.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
        if (!policy) return res.status(404).json({ message: 'Policy not found' });

        res.json({ message: 'Policy activated successfully', policy });
    } catch (error) {
        console.error('Error activating policy:', error);
        res.status(500).json({ message: `Error activating policy: ${error.message}` });
    }
};
// Deactivate a policy - Admin only
exports.deactivatePolicy = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied: Admins only" });
        }

        const policy = await Policy.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!policy) return res.status(404).json({ message: 'Policy not found' });

        res.json({ message: 'Policy deactivated successfully', policy });
    } catch (error) {
        console.error('Error deactivating policy:', error);
        res.status(500).json({ message: `Error deactivating policy: ${error.message}` });
    }
};