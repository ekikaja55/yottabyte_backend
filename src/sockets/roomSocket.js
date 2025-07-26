// src/sockets/roomSocket.js
// Room Socket Handlers
// This module handles WebSocket connections for room-related events.

const Room = require('../models/Room');

const roomSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);
        
        socket.on('join-room', async ({ roomId }) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) return;
                
                socket.join(roomId);
                io.to(roomId).emit('sync-state', room.state);
                io.to(roomId).emit('queue-updated', room.queue);
            } catch (err) {
                console.error('Join room socket error:', err.message);
            }
        });

        socket.on('player-action', async ({ roomId, action }) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) return;
                
                room.state = { ...action, updatedAt: Date.now() };
                await room.save();
                
                socket.to(roomId).emit('sync-state', room.state);
            } catch (err) {
                console.error('Player action socket error:', err.message);
            }
        });

        socket.on('update-queue', async ({ roomId, queue }) => {
            try {
                const room = await Room.findById(roomId);
                if (!room) return;
                
                room.queue = queue;
                await room.save();
                
                io.to(roomId).emit('queue-updated', room.queue);
            } catch (err) {
                console.error('Update queue socket error:', err.message);
            }
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
        });
    });
};

module.exports = roomSocket;
