const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  date: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Destination', destinationSchema);