const User = require('../models/User');
const axios = require('axios');
 
// Set base URL for policy-service (from environment variables or default to localhost)
const POLICY_SERVICE_URL = process.env.POLICY_SERVICE_URL || 'http://localhost:5000';


exports.getBasicInfo = async (req, res) => {
    try {
        const userId = req.user.userId;  // Get userId from authenticated user (JWT)

        // Fetch basic user info (excluding sensitive data like password)
      //  const user = await User.findById(userId).select('name email dateOfBirth address');
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: `${user.role} info retrieved successfully`,
            data: user
        });
    } catch (error) {
        console.error('Error fetching basic user info:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
// Update user information
exports.updateUserInfo = async (req, res) => {
    try {
        const userId = req.user.userId; // Get the userId from the authenticated user
        const { maritalStatus, emergencyContactNumber, medicalConditions, address, phoneNumber } = req.body;

        // Find the user in the database
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the user's information (you can add more fields as needed)
        if (maritalStatus) user.maritalStatus = maritalStatus;
        if (emergencyContactNumber) user.emergencyContactNumber = emergencyContactNumber;
        if (medicalConditions) user.medicalConditions = medicalConditions;
        if (address) user.address = address;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        // Save the updated user record
        await user.save();

        return res.status(200).json({
            message: 'User information updated successfully',
            updatedUser: {
                maritalStatus: user.maritalStatus,
                emergencyContactNumber: user.emergencyContactNumber,
                medicalConditions: user.medicalConditions,
                address: user.address,
                phoneNumber: user.phoneNumber,
            }
        });

    } catch (error) {
        console.error('Error updating user info:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getAppliedPolicies = async (req, res) => {
    try {
        const userId = req.user.userId; // Extract the userId from the JWT (authenticated user)

        // Ensure the user exists (req.user should be populated by the authenticateToken middleware)
        if (!userId) {
          return res.status(404).json({
            status: 'error',
            message: 'User not found ',
          });
        }
        const user = await User.findById(userId)
      // If the user has no applied policies
       if (!user.policies || user.policies.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No policies applied by the user.',
          appliedPolicies: [],
        });
      }
    
      // Now, fetch the policy details for each policy the user has applied for
      const policies = [];
      for (let policyId of user.policies) {
        // Here, you may want to fetch policy details from the Policy Service
   
        const policyServiceURL = process.env.POLICY_SERVICE_URL || 'http://localhost:5001';
        const policyResponse = await axios.get(`${policyServiceURL}/api/policies/${policyId}`, {
          headers: {
            Authorization: `Bearer ${req.headers.authorization.split(' ')[1]}`, // Include the token
          },
        });
  
        const policy = policyResponse.data;
        policies.push(policy);
      }
  
      return res.status(200).json({
        status: 'success',
        appliedPolicies: policies, // Return the list of applied policies
      });
  
    } catch (error) {
      console.error('Error fetching applied policies:', error);
      return res.status(error.status || 500).json({
        status: 'error',
        message: error.message || 'Internal Server Error',
      });
    }
  };
// Fetch payment history
exports.getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.userId;  // Get userId from authenticated user (JWT)

        // Make API call to policy-service to get payment history
        const response = await axios.get(`${POLICY_SERVICE_URL}/api/policies/applications/paymentHistory`, {
            params: { userId }
        });

        if (response.data.length === 0) {
            return res.status(404).json({ message: 'No payment history found for the user' });
        }

        return res.status(200).json({
            message: 'Payment history retrieved successfully',
            data: response.data,
        });
    } catch (error) {
        console.error('Error fetching payment history:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Failed to fetch payment history' });
    }
};

exports.applyPolicy = async (req, res) => {
    try {
      const { paymentAmount,policyId } = req.body;
      //const { policyId } = req.params;
     // const userId = req.user.id; // Extract user ID from JWT
      const userId = req.user.userId;
      const policyServiceURL = process.env.POLICY_SERVICE_URL || 'http://localhost:5001';
      const token = req.headers['authorization'].split(' ')[1];// Get token from the Authorization header
      // Forward request to the Policy Service
      console.log(policyId,userId,paymentAmount,"user")

      const { data } = await axios.post(`${policyServiceURL}/api/policies/apply/${policyId}`, {
        userId,
        policyId,
        paymentAmount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the JWT token to the Policy Service
        }
    }
    
    );

     //console.log("data",data)
  
      res.status(201).json(data);
    } catch (error) {
      if (error.response) {
        // Extract the status and message from the Policy Service response
        const { status, data } = error.response;
        console.error('Error from Policy Service:', data);
  
        return res.status(status).json({ message: data.error || 'Error applying policy' });
      }
      console.error('Error delegating policy application:', error.message);
      res.status(500).json({ message: 'Failed to apply for policy', error: error.message });
    }
  };

exports.updateUserPolicies = async (req, res) => {
    try {
      const { userId } = req.params;
      const { policyId } = req.body;
  
      // Find user by ID and update their policies array
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
  
      // Add policy to user's policies list (if not already added)
      if (!user.policies.includes(policyId)) {
        user.policies.push(policyId);
        await user.save();
      }
  
      return res.status(200).json({
        status: 'success',
        message: 'User policies updated successfully',
      });
    } catch (error) {
      console.error('Error updating user policies:', error);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
  };
  
  exports.removePolicyFromUser = async (req, res) => {
    try {
        const userId=req.params.userId;
      const {policyId } = req.params;
  
      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Remove the policy from the user's policies
      user.policies = user.policies.filter(id => id.toString() !== policyId);
      await user.save();
  
      res.status(200).json({ message: 'Policy Cancelled successfully.' });
    } catch (error) {
      console.error('Error while cancelling the policy:', error.message);
      res.status(500).json({ message: 'Error while cancelling the policy', error: error.message });
    }
  };
  
// Renew policy
exports.renewPolicy = async (req, res) => {
    try {
        const applicationId = req.params.application_id;
        const userId = req.user.userId;
        const { renewalPaymentAmount } = req.body;

        // Fetch policy application from policy-service
        const applicationResponse = await axios.get(`${POLICY_SERVICE_URL}/api/policies/applications/${applicationId}`);
        const application = applicationResponse.data;

        // Check if the application belongs to the authenticated user
        if (application.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized access to this policy application.' });
        }

        // Validate grace period (handled in policy-service)
        const today = new Date();

        // Send renewal request to policy-service
        const renewalResponse = await axios.post(`${POLICY_SERVICE_URL}/api/policies/applications/${applicationId}/renew`, {
            renewalPaymentAmount,
        });

        return res.status(200).json({
            message: 'Policy renewed successfully',
            data: renewalResponse.data,
        });
    } catch (error) {
        console.error('Error in renewPolicy:', error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            error: error.response?.data || 'Failed to renew policy',
        });
    }
};

exports.cancelPolicy = async (req, res) => {
  try {
     const policyId = req.params.policyId; 
    //const { policyId } = req.params;
   // const userId = req.user.id; // Extract user ID from JWT
    const userId = req.user.userId;
 
    const policyServiceURL = process.env.POLICY_SERVICE_URL || 'http://localhost:5001';
    const token = req.headers['authorization'].split(' ')[1];// Get token from the Authorization header
    // Forward request to the Policy Service
 
    const { data } = await axios.post(`${policyServiceURL}/api/policies/cancel/${policyId}`, {
      userId,
      policyId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,  // Pass the JWT token to the Policy Service
      }
  }
  );

   // console.log("data",data)
   const user = await User.findById(userId);  // Retrieve the user from the database

   user.policies = user.policies.filter(id => id.toString() !== policyId.toString());

   console.log("user poliices",user.policies);

   // Save the updated user record
   await user.save();


    res.status(201).json(data);
  } catch (error) {
    if (error.response) {
      // Extract the status and message from the Policy Service response
      const { status, data } = error.response;
      console.error('Error from Policy Service:', data);

      return res.status(status).json({ message: data.error || 'Error canceling policy' });
    }
    console.error('Error delegating policy application:', error.message);
    res.status(500).json({ message: 'Failed to cancel for policy', error: error.message });
  }
};
