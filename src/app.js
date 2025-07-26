// src/app.js
// Yottabyte Backend Application
// This file is part of the Yottabyte project.
// It sets up the Express application, connects to the database, and configures routes. 
// The application uses environment variables for configuration and includes middleware for CORS and JSON parsing.


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const youtubeRoutes = require('./routes/youtube');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/youtube', youtubeRoutes);

module.exports = app;
