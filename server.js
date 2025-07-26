// server.js
// This file initializes the Yottabyte backend server.
// It sets up the Express application, connects to the database, and configures the server to   

const app = require('./src/app');
const http = require('http');
const { Server } = require('socket.io');
const roomSocket = require('./src/sockets/roomSocket');
require('dotenv').config();


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Initialize socket handlers
roomSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
