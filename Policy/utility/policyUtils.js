const moment = require('moment');
const Policy = require('../models/Policy');
const PolicyApplication = require('../models/PolicyApplication');
const axios = require('axios');

 exports.fetchPolicy = async (policyId,token) => {
    try {
      const policyServiceURL = process.env.POLICY_SERVICE_URL || 'http://localhost:5001';
     
      //console.log(policyId,"fetch");
      const response = await axios.get(`${policyServiceURL}/api/policies/${policyId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Attach the JWT token to the header
        },
      });
        return response.data;
    } catch (error) {
      console.error('Error fetching policy:', error.message);
      throw { status: 404, message: 'Policy not found' };
    }
  };

  exports.fetchUser = async (userId,token) => {
    try {
      const userServiceURL = process.env.USER_SERVICE_URL || 'http://localhost:5000';
      console.log(`${userServiceURL}/api/users/${userId}`,"userigo")
      const response = await axios.get(`${userServiceURL}/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the JWT token to the Policy Service
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error.message);
      throw { status: 404, message: 'User not found' };
    }
  };
// // Validate if a user's age falls within the policy's allowed range
exports.validateUserAge = (user, policy) => {
    const userAge = moment().diff(moment(user.dateOfBirth), 'years');
    if (userAge < policy.policyHolderMinAge || (policy.policyHolderMaxAge && userAge > policy.policyHolderMaxAge)) {
        throw {
            status: 400,
            message: `User does not meet the age requirements for this policy. Age(${userAge}) must be between ${policy.policyHolderMinAge} and ${
                policy.policyHolderMaxAge || 'N/A'
            }.`,
        };
    }
};

// // Check for excluded medical conditions
exports.checkExclusions = (user, policy) => {
    if (policy.exclusions && policy.exclusions.length > 0) {
        const userMedicalConditions = user.medicalConditions.map((cond) => cond.condition.toLowerCase());
        const exclusionFound = policy.exclusions.some((exclusion) =>
            userMedicalConditions.includes(exclusion.toLowerCase())
        );
        if (exclusionFound) {
            throw { status: 400, message: 'User has medical conditions that are excluded by this policy.' };
        }
    }
};

// // Validate payment amount against policy premium
exports.validatePaymentAmount = (paymentAmount, premiumAmount) => {
    if (paymentAmount !=premiumAmount) {
        throw { status: 400, message: `Payment amount is mismatch. The required premium is ${premiumAmount}.` };
    }
};

// Validate policy renewal grace period
exports.validateGracePeriod = (policyEndDate) => {
    const today = new Date();
    const gracePeriodEnd = new Date(policyEndDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 15); // Add 15 days
    if (today > gracePeriodEnd) {
        throw { status: 400, message: 'The policy renewal grace period has expired. Renewal is no longer possible.' };
    }
};

exports.validateRenewalWindow = (policyEndDate) => {
    const today = new Date();
    const gracePeriodEnd = new Date(policyEndDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 15); // Add 15 days for grace period

    const renewalStartDate = new Date(policyEndDate); // Start of renewal window
    renewalStartDate.setMonth(policyEndDate.getMonth() - 1); // One month before policy end date

    if (today < renewalStartDate || today > gracePeriodEnd) {
        throw {
            status: 400,
            message: `Policy renewal is only allowed within the last month before expiration or up to 15 days after expiration. Policy end date: ${policyEndDate.toISOString()}`,
        };
    }

};
