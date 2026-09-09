const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API health check
app.get('/', (req, res) => {
  res.send('SettleIn Student Housing API (XAMPP MySQL) is running');
});

// Mount Routes
app.use('/api/properties', require('./routes/properties'));
app.use('/api/users', require('./routes/user'));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
