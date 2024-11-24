require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swaggerConfig');

const policyRoutes = require('./routes/policyRoutes');
const policyApplicationRoutes = require('./routes/policyApplicationRoutes');

const app = express();
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.POLICY_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("Policy Service connected to MongoDB"))
  .catch(err => console.error("Could not connect to MongoDB", err));

// Routes
app.use('/api/policies', policyRoutes);
app.use('/api/policies', policyApplicationRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Start the server
const PORT = process.env.POLICY_SERVICE_PORT || 5001;
app.listen(PORT, () => console.log(`Policy Service running on port ${PORT}`));
