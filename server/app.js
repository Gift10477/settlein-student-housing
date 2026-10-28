const express = require('express');
const cors = require('cors');
require('dotenv').config();

const path = require('path');
const { requireApiKey } = require('./middleware/auth');
const { rateLimit } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.disable('x-powered-by');
app.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(express.json());
app.use(requireApiKey);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })); // 100 requests per API key per 15 minutes

// API health check
app.get('/', (req, res) => {
  res.send('SettleIn Student Housing API (XAMPP MySQL) is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Serve browsable API documentation and raw OpenAPI contract
app.use('/docs', express.static(path.join(__dirname, '../docs')));
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, '../openapi.yaml'));
});

// Mount Routes
app.use('/api/market-prices', require('./routes/marketPrices'));
app.use('/api/v1/market-prices', require('./routes/marketPrices'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/v1/properties', require('./routes/properties'));
app.use('/api/users', require('./routes/user'));
app.use('/api/v1/users', require('./routes/user'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/v1/bookings', require('./routes/bookings'));

app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

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
  const status = err.type === 'entity.too.large' ? 413 : 500;
  return res.status(status).json({
    error: status === 413 ? 'Payload Too Large' : 'Internal Server Error',
    message: status === 413 ? 'Request body is too large.' : 'An unexpected server error occurred.',
    status_code: status,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
