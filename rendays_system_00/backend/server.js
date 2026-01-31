const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Enable CORS with detailed logging
app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true 
}));

// Logging middleware - THIS IS IMPORTANT
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));

app.get('/', (req, res) => {
  res.json({ message: 'Don Pedro API Running! 💈' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('=== SERVER ERROR ===');
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Frontend should connect to: http://localhost:${PORT}`);
});