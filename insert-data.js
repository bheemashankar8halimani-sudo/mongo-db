const mongoose = require('mongoose');
require('dotenv').config();

// Import the Destination model
const Destination = require('./models/Destination');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data to insert
const sampleDestinations = [
  {
    name: "Paris",
    location: "France",
    description: "City of Light and love",
    date: new Date("2024-06-15")
  },
  {
    name: "Tokyo",
    location: "Japan",
    description: "Vibrant metropolis with rich culture",
    date: new Date("2024-07-20")
  },
  {
    name: "New York",
    location: "USA",
    description: "The Big Apple with iconic landmarks",
    date: new Date("2024-08-10")
  },
  {
    name: "Sydney",
    location: "Australia",
    description: "Harbor city with Opera House",
    date: new Date("2024-09-05")
  }
];

// Insert data
async function insertData() {
  try {
    console.log('Inserting sample destinations...');
    
    // Clear existing data
    await Destination.deleteMany({});
    console.log('Cleared existing destinations');
    
    // Insert new data
    const result = await Destination.insertMany(sampleDestinations);
    console.log(`Inserted ${result.length} destinations`);
    console.log(result);
    
    // Display all destinations
    const allDestinations = await Destination.find();
    console.log('\nAll destinations:');
    console.log(allDestinations);
    
    process.exit(0);
  } catch (error) {
    console.error('Error inserting data:', error);
    process.exit(1);
  }
}

insertData();