// models/Room.js
const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  queue: {
    type: Array,
    default: []
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  state: {
    action: {
      type: String,
      enum: ['play', 'pause', 'seek'],
      default: 'pause'
    },
    timestamp: {
      type: Number,
      default: 0
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }
})

module.exports = mongoose.model('Room', roomSchema)


