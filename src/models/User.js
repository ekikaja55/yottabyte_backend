// src/models/User.js
// User Model
// This file defines the User model for the Yottabyte backend.
// It uses Mongoose to define the schema and structure of a user, including its properties and
// relationships with rooms.
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
