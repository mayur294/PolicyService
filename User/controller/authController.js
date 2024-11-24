const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register a new user
exports.registerUser = async (req, res) => {
    console.log(req.body); // Log the incoming data

    // Destructure all necessary fields from the request body
    const { 
        name, email, password, role, phoneNumber, dateOfBirth, maritalStatus, nationality, gender,
         address, city, state, pincode, medicalConditions, emergencyContact 
    } = req.body;

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Optionally validate or set default values for fields
    const defaultRole = role || 'policyholder'; // Default to 'policyholder' if not provided
    const defaultMaritalStatus = maritalStatus || 'single'; // Default to 'single' if not provided

    try {
        // Hash the password
         // Create a new user instance with the updated fields
        const user = new User({
            name,
            email,
            password,
            role: defaultRole,
            phoneNumber,
            dateOfBirth,
            maritalStatus: defaultMaritalStatus,
            nationality,
            gender,
            address,
            city,
            state,
            pincode,
            medicalConditions,
            emergencyContact
        });

        // Save the new user to the database
        await user.save();

        // Return success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        // Handle errors (e.g., validation errors, database issues)
        console.error(error);
        res.status(500).json({ message: `Error registering user: ${error.message}` });
    }
};

// Login the user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
       

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
       
        // Compare the password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
       
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET, // Replace with a strong secret key
            { expiresIn: '1h' }
        );

        res.json({
            message: `${user.role} Login successful`,
            token
        });
    } catch (error) {
        res.status(500).json({ message: `Error logging in: ${error.message}` });
    }
};
