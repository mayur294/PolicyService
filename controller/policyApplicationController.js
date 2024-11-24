const jwt = require('jsonwebtoken');
const {fetchPolicy,fetchUser,validatePaymentAmount,validateUserAge,checkExclusions,validateGracePeriod,validateRenewalWindow} = require('../utility/policyUtils');
const PolicyApplication = require('../models/PolicyApplication');
const Policy = require("../models/Policy");

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';

exports.getAppliedPolicies = async (req, res) => {
  try {
    //  const userId  = req.params.userId; // Extract User ID from request parameters
    const userId = req.user?.userId;// Extract `userId` from auth middleware
      console.log("Fetching policies for user:", userId);

      // Find all policy applications for the given user ID
      const policyApplications = await PolicyApplication.find({ userId });

      if (!policyApplications || policyApplications.length === 0) {
          return res.status(404).json({ error: 'No policy applications found for this user' });
      }

      return res.status(200).json({
          message: 'Policy applications retrieved successfully',
           applications: policyApplications
      });
  } catch (error) {
      console.error('Error retrieving policy applications:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAllPolicies = async (req, res) => {
  try {
    const filters = req.query; // Example: { type: 'health', status: 'active' }
    const policies = await Policy.find(filters); // Assuming a Policy model exists

    if (!policies || policies.length === 0) {
      return res.status(404).json({ message: 'No policies found.' });
    }

    const totalCount = await Policy.countDocuments(filters);
    return res.status(200).json({
      status: 'success',
      totalCount,
      data: policies,
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }

 };
 
 exports.getPolicyById = async (req, res) => {
  try {
    const { policyId } = req.params;
    const policy = await Policy.findById(policyId);

    if (!policy) {
      return res.status(404).json({ message: 'Policy not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: policy,
    });
  } catch (error) {
    console.error('Error fetching policy by ID:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
// Apply for a policy
exports.applyForPolicy = async (req, res) => {
    try {
      //  const { userId, policyId, paymentAmount } = req.body;
        const { policyId } = req.params;
        const { paymentAmount } = req.body; // Keep `paymentAmount` from request body
        const userId = req.user?.userId; // Assume `req.user` is populated by authentication middleware
  

        // Fetch policy and user
        
        const token1 = req.headers['authorization'].split(' ')[1]; // Get the token from the Authorization header
        const policy = await fetchPolicy(policyId,token1);
        if (!policy.isActive)return res.status(400).json({ error: 'Policy is not active' });

     
        // Fetch user from the User Service
        const user = await fetchUser(userId,token1);

        validateUserAge(user.data, policy);
        checkExclusions(user.data, policy);
        validatePaymentAmount(paymentAmount, policy.premiumAmount);

        const existingApplication = await PolicyApplication.findOne({
          userId,
          policyId
      });

      if (existingApplication) {
          return res.status(400).json({
              error: 'User has already applied for this policy'
          });
      }

      //console.log(policyI)
        // Generate a payment token

        // Create policy application
        const newPayment = { amount: paymentAmount, paymentDate: new Date(), status: 'pending', remarks: 'Initial payment for policy application' };
         // policyEndDate.setMonth(policyEndDate.getMonth() + policy.durationInMonths);
        const tokenPayload = { userId, policyId, paymentAmount, premiumAmount: policy.premiumAmount, timestamp: new Date(),policydurationInMonths:policy.durationInMonths,applicationType:"newpolicy" };
        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '5m' });
 
        const application = new PolicyApplication({
            userId,
            policyId,
            latestPayment: newPayment,
            paymentHistory: [],
            paymentToken: token,
          
         });
         await application.save();
       
       // const tokenPayload = { userId, policyId, paymentAmount, premiumAmount: policy.premiumAmount, timestamp: new Date() };

        return res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully. Waiting for payment confirmation.',
            applicationId: application._id,
            paymentToken: token,
        });
    } catch (error) {
        console.error('Error in applyForPolicy:', error);
        return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal Server Error' });
    }
};
exports.cancelPolicyApplication = async (req, res) => {
  try {
     
    const { policyId } = req.params;
    const userId = req.user?.userId; // Assume `req.user` is populated by authentication middleware
  //console.log(policyId,userId,"user")

      // Find the policy application for the user
      const policyApplication = await PolicyApplication.findOne({ userId, policyId });
      if (!policyApplication) {
          return res.status(404).json({ error: 'Policy application not found' });
      }
      console.log("cancel policy application",policyApplication)

      // Check if the policy is already canceled
      if (policyApplication.status === 'canceled') {
        console.error(' policy alread cancelled');
          return res.status(400).json({ error: 'Policy is already canceled' });
      }
        
      // Update the policy application status to "canceled"
      policyApplication.status = 'canceled';
      policyApplication.canceled = {
          isCanceled: true,
          cancellationDate: new Date(),
          reason: req.body.reason || 'No reason provided',
          remarks: req.body.remarks || '',
      };

      await policyApplication.save();

      return res.status(200).json({
          message: 'Policy application canceled successfully',
          policyId: policyApplication.policyId,
          applicationId: policyApplication._id,
      });
  } catch (error) {
      console.error('Error canceling policy application:', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.renewPolicy = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { paymentAmount } = req.body; // Keep `paymentAmount` from request body
    const userId = req.user?.userId; // Assume `req.user` is populated by authentication middleware

      // Fetch the application by ID
      const token1 = req.headers['authorization'].split(' ')[1]; // Get the token from the Authorization header
      const application = await PolicyApplication.findOne({ userId, policyId });

      if (!application) {
          return res.status(404).json({ error: 'Policy application not found' });
      }

      // Verify the user owns this application
      if (application.userId.toString() !== userId) {
          return res.status(403).json({ error: 'Unauthorized to renew this policy' });
      }

      // Ensure the policy is active
      const policy = await fetchPolicy(application.policyId, token1);
      if (!policy.isActive) {
          return res.status(400).json({ error: 'Policy is not active and cannot be renewed' });
      }
      const user = await fetchUser(userId,token1);

      // Check if the policy is eligible for renewal
      validateGracePeriod(application.policyEndDate);
      validateRenewalWindow(application.policyEndDate);
 
      // Validate payment amount matches the policy premium
      validateUserAge(user.data, policy);
      checkExclusions(user.data, policy);
      validatePaymentAmount(paymentAmount, policy.premiumAmount);

      // Generate a payment token

      // Add payment to the history and update application
      const newPayment = { amount: paymentAmount, paymentDate: new Date(), status: 'pending', remarks: 'Renewal payment' };
      //application.paymentHistory.push(newPayment);
      application.latestPayment = newPayment;

      // Extend the policy end date
      // application.policyEndDate = new Date(application.policyEndDate.setMonth(application.policyEndDate.getMonth() + policy.durationInMonths));
      // console.log("policy end datse",application.policyEndDate);
      // Save the updated application
      await application.save();
      // const paymentType="renew";
       const tokenPayload = { userId, policyId, paymentAmount, premiumAmount: policy.premiumAmount, timestamp: new Date(),transectionId:application.latestPayment._id,policydurationInMonths:policy.durationInMonths,applicationType:"Renewl" };
      const paymentToken = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '5m' });
       // console.log(application.latestPayment._id,"payment id")
      return res.status(200).json({
          status: 'success',
          message: 'Policy renewal successful. Waiting for payment confirmation.',
          applicationId: policyId,
          paymentToken: paymentToken,
          transectionId:application.latestPayment._id
      });
  } catch (error) {
      console.error('Error in renewPolicy:', error);
      return res.status(error.status || 500).json({ status: 'error', message: error.message || 'Internal Server Error' });
  }
};
 