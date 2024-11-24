const mongoose = require('mongoose');
const PolicyApplicationStatus = require('../statusEnum');
const PaymentSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    remarks: { type: String }
});

const PolicyApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
    applicationDate: { type: Date, default: Date.now },
    status: { type: String, enum: Object.values(PolicyApplicationStatus), default: PolicyApplicationStatus.PENDING },
    latestPayment: PaymentSchema,
    paymentHistory: [PaymentSchema],
    policyEndDate: { type: Date },
    remarks: { type: String },
    paymentToken: { type: String, required: true },
    canceled: { 
        isCanceled: { type: Boolean, default: false },
        cancellationDate: { type: Date },
        reason: { type: String },
        remarks: { type: String },
    }, // New field for cancellation-related data

});

module.exports = mongoose.model('PolicyApplication', PolicyApplicationSchema);

 