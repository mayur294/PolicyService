// models/Policy.js
const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
    policyName: { type: String, required: true },                  // Policy name
    policyType: { type: String, enum: ['health', 'life', 'auto', 'home'], required: true },  // Policy type
    description: { type: String },                                 // Policy description
    premiumAmount: { type: Number, required: true },               // Monthly/yearly premium cost
    durationInMonths: { type: Number, required: true },            // Policy term duration in months
    termsAndConditions: { type: String, required: true },          // Policy terms and conditions
    coverageAmount: { type: Number, required: true },              // Max coverage amount
    deductible: { type: Number, default: 0 },                      // Out-of-pocket cost before coverage
    eligibilityCriteria: { type: String },                         // Eligibility requirements
    renewalPolicy: { type: String, enum: ['Automatic', 'Manual'], default: 'Automatic' }, // Renewal type
    cancellationPolicy: { type: String },                          // Terms for policy cancellation
    createdDate: { type: Date, default: Date.now },                // Creation date of policy
    lastUpdated: { type: Date, default: Date.now },                // Last update date of policy
    isActive: { type: Boolean, default: true },                    // Policy status (active/inactive)
    maxClaimAmount: { type: Number },                              // Max claimable amount per incident/year
    waitingPeriodInMonths: { type: Number, default: 0 },           // Waiting period before benefits begin
   // applicableRegions: [{ type: String }],                         // Regions where policy applies
    policyHolderMinAge: { type: Number, default: 18 },             // Minimum age requirement
    policyHolderMaxAge: { type: Number },                          // Maximum age limit
    additionalBenefits: [{ type: String }],                        // Additional benefits provided
    exclusions: [{ type: String }],                                 // Exclusions from policy coverage
   
});

module.exports = mongoose.model('Policy', PolicySchema);
