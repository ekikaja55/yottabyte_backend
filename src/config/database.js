// src/config/database.js
// This file handles the connection to the MongoDB database for the Yottabyte backend.
// It uses Mongoose to connect to the database using the URI specified in environment variables.
require('dotenv').config();
const mongoose = require('mongoose');

/** * Connects to the MongoDB database using Mongoose.
 * @returns {Promise} - Returns a promise that resolves when the connection is successful.
 * @throws {Error} - Throws an error if the connection fails.   
 * @description This function establishes a connection to the MongoDB database using the URI
 * specified in the environment variables. It logs a success message upon connection or an error message if the connection fails.
 */ 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
