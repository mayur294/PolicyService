// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const UserSchema = new mongoose.Schema(
    {
      // Personal Details
      name: { type: String, required: true },
      email: { type: String, unique: true, required: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['policyholder', 'user', 'underwriter', 'admin'], required: true },
      phoneNumber: { type: String, required: true },
      dateOfBirth: { type: Date, required: true },
      maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'], default: 'single' },
      nationality: { type: String },
      gender: { type: String, enum: ['male', 'female', 'other'], required: true },
   
      // Address Details
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
   
      // Medical Details
      medicalConditions: [{ condition: { type: String }, description: { type: String } }],
      emergencyContact: { name: { type: String }, relationship: { type: String }, phoneNumber: { type: String } },
  
      // Claims and Policies
      claims: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Claim' }],
      policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Policy' }],
  
     },
    { timestamps: true }
  );
  
// Hash password before saving the user
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
