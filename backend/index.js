require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Import routes
const behaviorRoutes = require('./routes/behaviorRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const schoolRoutes = require('./routes/schoolRoutes');

const app = express();

/// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

/// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Behavior Tracking API',
      version: '1.0.0',
      description: 'API documentation for the Student Behavior Tracking System',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./index.js', './routes/*.js'], // Look for swagger definitions in these files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a welcome message to confirm the API is running.
 *     responses:
 *       200:
 *         description: Welcome message.
 */
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Student Behavior Tracking System API' });
});

// Setup Routes mapping
app.use('/api/behaviors', behaviorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/school', schoolRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
