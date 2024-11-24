const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Policy Management API',
      version: '1.0.0',
      description: 'API for managing user policies, including applying, fetching, renewing, and canceling policies.',
    },
    servers: [
      {
        url: 'http://localhost:5001/api', // Update with your server URL
        description: 'Development server',
      },
    ],
  },
  apis: ['./controller/*.js'], // Path to your annotated controllers
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;