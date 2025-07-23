const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
require('dotenv').config()

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: '*', // di production sebaiknya di-lock
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 4000

// === IN-MEMORY ROOM STATE ===
const roomState = {} // { [roomId]: { action: 'play', timestamp: 42.5, updatedAt: 123456789 } }

app.use(cors())

app.get('/', (req, res) => {
  res.send('ByteDance × ByteSpace backend is running!')
})

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id)

  // User join room
  socket.on('join-room', (roomId) => {
    socket.join(roomId)
    console.log(`${socket.id} joined room ${roomId}`)

    // Kirim state terbaru ke client baru
    if (roomState[roomId]) {
      socket.emit('sync-state', roomState[roomId])
    } else {
      // Jika belum ada state, kirim default
      socket.emit('sync-state', {
        action: 'pause',
        timestamp: 0,
        updatedAt: Date.now()
      })
    }
  })

  // Host mengirim aksi (play/pause/skip)
  socket.on('player-action', ({ roomId, action, timestamp }) => {
    console.log(`🎵 Action "${action}" @${timestamp}s in room ${roomId}`)

    // Simpan state terbaru
    roomState[roomId] = {
      action,
      timestamp,
      updatedAt: Date.now()
    }

    // Broadcast ke semua client lain dalam room
    socket.to(roomId).emit('player-action', {
      action,
      timestamp,
      updatedAt: roomState[roomId].updatedAt
    })
  })

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
