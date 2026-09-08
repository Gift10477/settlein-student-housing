const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('SettleIn API is running');
});

const studentRoutes = require('./routes/students');
app.use('/api/students', studentRoutes);

const propertyRoutes = require('./routes/properties');
app.use('/api/properties', propertyRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});