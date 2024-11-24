const jwt = require('jsonwebtoken');
const PolicyApplication = require('../models/PolicyApplication');
const axios = require('axios');

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key'; // Use the same secret key used for signing

// Helper function to create a payment record
function createPaymentRecord(amount, status, remarks) {
    return {
        amount: amount,
        paymentDate: new Date(),
        status: status,
        remarks: remarks
    };
}

exports.verifyPayment = async (req, res) => {
    try {
        const { token } = req.body;

        // Verify and decode the JWT token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, SECRET_KEY);
        } catch (err) {
            const errorMessage = err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token';
            return res.status(400).json({ error: errorMessage });
        }

        const { userId, policyId, paymentAmount ,policydurationInMonths,applicationType} = decodedToken;

         const policyApplication = await PolicyApplication.findOne({ userId,policyId});
        console.log("verify payment",decodedToken)

        if (!policyApplication) {
            return res.status(404).json({ error: 'Policy application not found' });
        }

        // Check if the payment is already completed
        if (policyApplication.latestPayment.status === 'completed') {
            return res.status(400).json({ error: 'Payment has already been verified' });
        }

        // Mock payment gateway verification (Replace with actual gateway logic)
        const paymentVerified = true;

        if (paymentVerified) {
            // Check if the payment amount matches the premium amount
            if (paymentAmount < policyApplication.latestPayment.amount) {
                const failedPayment = createPaymentRecord(paymentAmount, 'failed', `Payment mismatch: Expected ${policyApplication.latestPayment.amount}, Received ${paymentAmount}`);
                policyApplication.paymentHistory.push(failedPayment);
                await policyApplication.save();

                return res.status(400).json({
                    error: `Payment amount mismatch. Expected: ${policyApplication.latestPayment.amount}, Received: ${paymentAmount}.`,
                });
            }

            const policyEndDate = new Date();
            policyEndDate.setMonth(policyEndDate.getMonth() + policydurationInMonths);
        
            const completedPayment = createPaymentRecord(paymentAmount, 'completed', `Payment successfully verified for ${applicationType} Policy`);
            policyApplication.policyEndDate=policyEndDate;
            policyApplication.latestPayment = completedPayment;
            policyApplication.paymentHistory.push(completedPayment);
            policyApplication.status = 'approved'; // Set policy application status to approved

            // Save updated application
            await policyApplication.save();
            return res.status(200).json({
                message: `Payment verified and policy approved for ${applicationType} Policy`,
                applicationId: policyApplication._id,
            });
        } else {
            // Payment failure scenario
            const failedPayment = createPaymentRecord(paymentAmount, 'failed', 'Payment failed due to gateway error');
            policyApplication.paymentHistory.push(failedPayment);
            await policyApplication.save();

            return res.status(400).json({ error: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
