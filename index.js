// index.js (Express + MongoDB + Socket.IO)
import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import axios from 'axios';

import User from './models/User.js';
import Room from './models/Room.js';
import authMiddleware from './middleware/auth.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));


// YouTube search endpoint
app.get('/api/youtube/search', authMiddleware, async (req, res) => {
    console.log(crypto.randomUUID());
    
    const q = req.query.q;
    if (!q) return res.status(400).json({ message: 'Query required' });

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q,
                key: process.env.YOUTUBE_API_KEY,
                type: 'video',
                maxResults: 10
            }
        });

        console.log('YouTube search response:', JSON.stringify(response.data, null, 2));
        const results = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            channel: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high.url
        }));

        res.json(results);
    } catch (err) {
        console.error('YouTube search error:', err.message);
        res.status(500).json({ message: 'YouTube search failed' });
    }
});


// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existing = await User.findOne({ username });
        if (existing) return res.status(409).json({ message: 'User already exists' });
        const hashed = await bcryptjs.hash(password, 10);
        const user = await User.create({ username, password: hashed, roomId: null });
        res.json({ message: 'Registered' });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        console.log(process.env.JWT_SECRET);

        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });
        const valid = await bcryptjs.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
        res.json({ token });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Login failed' });
    }
});


// Post Room endpoints
app.post('/api/room', authMiddleware, async (req, res) => {
    const { name } = req.body;

    try {
        const room = await Room.create({
            name,
            owner: req.user.id,
            queue: [],
            state: null
        });

        // Tambahkan roomId ke user yang membuat ruangan
        const user = await User.findById(req.user.id);
        user.roomId = room._id;
        await user.save();

        res.json(room);
    } catch (err) {
        console.error('Create room error:', err.message);
        res.status(500).json({ message: 'Failed to create room' });
    }
});

// Get all rooms endpoint
app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        console.error('Get all rooms error:', err.message);
        res.status(500).json({ message: 'Failed to get rooms' });
    }
});

// join room endpoint
app.post('/api/room/join', authMiddleware, async (req, res) => {
    const { roomId } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        const existing = await User.findOne({ _id: req.user.id });

        if (!existing) return res.status(404).json({ message: 'User not found' });

        existing.roomId = roomId;
        await existing.save();

        res.json({ message: 'Joined room', room });
    } catch (err) {
        console.error('Join room error:', err.message);
        res.status(500).json({ message: 'Failed to join room' });
    }
});

// Leave room endpoint
app.post('/api/room/leave', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.roomId = null;
        await user.save();

        res.json({ message: 'Left room' });
    } catch (err) {
        console.error('Leave room error:', err.message);
        res.status(500).json({ message: 'Failed to leave room' });
    }
});

//queue endpoint
app.post('/api/room/queue', authMiddleware, async (req, res) => {
    const { roomId, queue } = req.body;

    try {
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: 'Room not found' });

        room.queue = queue;
        await room.save();

        res.json({ message: 'Queue updated' });
    } catch (err) {
        console.error('Update queue error:', err.message);
        res.status(500).json({ message: 'Failed to update queue' });
    }
});

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    
    socket.on('join-room', async ({ roomId }) => {
        const room = await Room.findById(roomId);
        if (!room) return;
        socket.join(roomId);
        io.to(roomId).emit('sync-state', room.state);
        io.to(roomId).emit('queue-updated', room.queue);
    });

    socket.on('player-action', async ({ roomId, action }) => {
        const room = await Room.findById(roomId);
        if (!room) return;
        room.state = { ...action, updatedAt: Date.now() };
        await room.save();
        socket.to(roomId).emit('sync-state', room.state);
    });

    socket.on('update-queue', async ({ roomId, queue }) => {
        const room = await Room.findById(roomId);
        if (!room) return;
        room.queue = queue;
        await room.save();
        io.to(roomId).emit('queue-updated', room.queue);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
});

const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
