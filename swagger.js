const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const express = require('express');
const app = express();


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'auth-jwt-otp',
      version: '1.0.0',
      description: 'authentication using jwt and otp based registration',
    },

    servers: [
      {
        url: 'http://localhost:4000/api',
      },
    ],
    basePath: '/api',
    components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
  },
  apis: ['./src/controllers/*.js'],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

module.exports = app;
