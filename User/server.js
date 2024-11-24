const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.USER_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("User Service connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Start the server
const PORT = process.env.USER_SERVICE_PORT || 5000;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
