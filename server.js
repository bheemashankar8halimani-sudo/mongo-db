const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const Destination = require('./models/Destination');

// Connect to MongoDB
let dbConnected = false;
connectDB().then(conn => {
  if (conn) {
    dbConnected = true;
  }
}).catch(err => {
  console.log('Database connection failed, continuing without database connection');
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Helper function for database operations
const handleDBOperation = async (operation, res) => {
  if (!dbConnected) {
    return res.status(503).json({ 
      message: 'Database connection unavailable. Please check MongoDB setup.',
      data: []
    });
  }
  try {
    return await operation();
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Routes

// GET all destinations
app.get('/api/destinations', async (req, res) => {
  const result = await handleDBOperation(async () => {
    const destinations = await Destination.find().sort({ createdAt: -1 });
    return res.json(destinations);
  }, res);
  return result;
});

// GET a single destination by ID
app.get('/api/destinations/:id', async (req, res) => {
  const result = await handleDBOperation(async () => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    return res.json(destination);
  }, res);
  return result;
});

// POST a new destination
app.post('/api/destinations', async (req, res) => {
  const result = await handleDBOperation(async () => {
    const { name, location, description, date } = req.body;
    
    const destination = new Destination({
      name,
      location,
      description,
      date: date ? new Date(date) : null
    });
    
    const newDestination = await destination.save();
    return res.status(201).json(newDestination);
  }, res);
  return result;
});

// PUT (update) a destination
app.put('/api/destinations/:id', async (req, res) => {
  const result = await handleDBOperation(async () => {
    const { name, location, description, date } = req.body;
    
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    destination.name = name;
    destination.location = location;
    destination.description = description;
    destination.date = date ? new Date(date) : null;
    
    const updatedDestination = await destination.save();
    return res.json(updatedDestination);
  }, res);
  return result;
});

// DELETE a destination
app.delete('/api/destinations/:id', async (req, res) => {
  const result = await handleDBOperation(async () => {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    
    await destination.remove();
    return res.json({ message: 'Destination removed' });
  }, res);
  return result;
});

// Serve frontend static files
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open your browser to http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});