// src/controllers/authController.js
// This file defines the authentication controller for the Yottabyte backend.
// It handles user registration and login functionality, including password hashing and JWT token generation.

const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

/** * Registers a new user.
 * @param {Object} req - The request object containing user details
 * @param {Object} res - The response object to send the result
 * @returns {Object} - Returns a success message or an error message
 * @throws {Error} - Throws an error if registration fails.
 * @description This function handles user registration by checking for existing users,
 * hashing the password, and creating a new user in the database.
 */

const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        
        if (existing) {
            return res.status(409).json({ message: 'User already exists' });
        }
        
        const hashed = await bcryptjs.hash(password, 10);
        await User.create({ username, password: hashed, roomId: null });
        
        res.json({ message: 'Registered successfully' });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ message: 'Registration failed' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const valid = await bcryptjs.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );
        
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Login failed' });
    }
};

module.exports = { register, login };
