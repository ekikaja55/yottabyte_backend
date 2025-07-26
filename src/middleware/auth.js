// src/middleware/auth.js
// This file defines the authentication middleware for the Yottabyte backend.   
// It checks for a valid JWT token in the request headers and verifies the user's identity.
// If the token is valid, it allows the request to proceed; otherwise, it returns an
// unauthorized response.

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

/**
 * Middleware to authenticate requests using JWT.
 * It checks for the presence of a Bearer token in the Authorization header,
 * verifies the token, and extracts the user information.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function to call if authentication is successful.
 * @returns {Object} - Returns a 401 Unauthorized response if the token is missing or invalid.
 * @throws {Error} - Throws an error if the token verification fails.
 */

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
