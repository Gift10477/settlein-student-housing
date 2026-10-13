const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health check
app.get('/', (req, res) => {
  res.send('SettleIn Student Housing API (XAMPP MySQL) is running');
});

// Serve browsable API documentation and raw OpenAPI contract
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '../openapi.yaml'));
});

// Mount Routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/v1/properties', require('./routes/properties'));
app.use('/api/users', require('./routes/user'));
app.use('/api/v1/users', require('./routes/user'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/v1/bookings', require('./routes/bookings'));

// Global error handler: ensures error responses return consistent JSON format
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid JSON payload. Please check your request body syntax.',
      status_code: 400,
      timestamp: new Date().toISOString()
    });
  }
  return res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected server error occurred.',
    status_code: err.status || 500,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;