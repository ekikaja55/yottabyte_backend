// src/routes/rooms.js
// This file defines the routes for room-related functionality in the Yottabyte backend.

const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
    createRoom,
    getAllRooms,
    getRoomById,
    joinRoom,
    leaveRoom,
    updateQueue
} = require('../controllers/roomController');

const router = express.Router();

router.post('/', authMiddleware, createRoom);
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/join', authMiddleware, joinRoom);
router.post('/leave', authMiddleware, leaveRoom);
router.post('/queue', authMiddleware, updateQueue);

module.exports = router;
