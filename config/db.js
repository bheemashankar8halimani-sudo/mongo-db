const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('Please ensure MongoDB is running or update the connection string in .env for MongoDB Atlas');
    console.log('To use MongoDB Atlas:');
    console.log('1. Sign up at https://www.mongodb.com/cloud/atlas');
    console.log('2. Create a free cluster');
    console.log('3. Get your connection string');
    console.log('4. Update MONGODB_URI in .env file');
    // We won't exit here to allow the server to start even without DB connection
    // process.exit(1);
  }
};

module.exports = connectDB;