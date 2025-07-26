// src/controllers/roomController.js
// This file contains the controller functions for room-related functionality in the Yottabyte backend. 

const Room = require('../models/Room');
const User = require('../models/User');

/**
 * Creates a new room.
 * @param {Object} req - The request object containing room details
 * @param {Object} res - The response object to send the result
 * @returns {Object} - Returns the created room object or an error message
 * @throws {Error} - Throws an error if room creation fails.
 * @description This function handles the creation of a new room.
 */

const createRoom = async (req, res) => {
    try {
        const { name } = req.body;

        const room = await Room.create({
            name,
            owner: req.user.id,
            queue: [],
            state: null
        });

        // Add roomId to user who created the room
        await User.findByIdAndUpdate(req.user.id, { roomId: room._id });

        res.json(room);
    } catch (err) {
        console.error('Create room error:', err.message);
        res.status(500).json({ message: 'Failed to create room' });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate('owner', 'username');
        res.json(rooms);
    } catch (err) {
        console.error('Get all rooms error:', err.message);
        res.status(500).json({ message: 'Failed to get rooms' });
    }
};

const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id).populate('owner', 'username');

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json(room);
    } catch (err) {
        console.error('Get room error:', err.message);
        res.status(500).json({ message: 'Failed to get room info' });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.roomId = roomId;
        await user.save();

        res.json({ message: 'Joined room', room });
    } catch (err) {
        console.error('Join room error:', err.message);
        res.status(500).json({ message: 'Failed to join room' });
    }
};

const leaveRoom = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.roomId = null;
        await user.save();

        res.json({ message: 'Left room' });
    } catch (err) {
        console.error('Leave room error:', err.message);
        res.status(500).json({ message: 'Failed to leave room' });
    }
};

const updateQueue = async (req, res) => {
    try {
        const { roomId, queue } = req.body;

        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        room.queue = queue;
        await room.save();

        res.json({ message: 'Queue updated' });
    } catch (err) {
        console.error('Update queue error:', err.message);
        res.status(500).json({ message: 'Failed to update queue' });
    }
};

module.exports = {
    createRoom,
    getAllRooms,
    getRoomById,
    joinRoom,
    leaveRoom,
    updateQueue
};
