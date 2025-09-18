const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
const authRoutes = require('./api/modules/user/user.routes');
app.use('/api/auth', authRoutes);

async function connectDb() {
  // Allow running the server without MongoDB when SKIP_DB=true
  if (String(process.env.SKIP_DB).toLowerCase() === 'true') {
    console.warn('[startup] SKIP_DB is true – skipping MongoDB connection.');
    return;
  }
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillbridge_dev';
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
}

module.exports = { app, connectDb };


