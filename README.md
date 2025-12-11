# Travel Destinations Manager with MongoDB

A full-stack travel destinations manager application with CRUD operations and MongoDB storage.

## Features

- Create, Read, Update, and Delete travel destinations
- Store data persistently in MongoDB
- Responsive and modern UI
- RESTful API backend

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```
   npm install
   ```

3. Set up MongoDB:
   - Install MongoDB locally or create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Update the MongoDB connection string in the `.env` file if needed

4. Start the application:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## Project Structure

```
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   └── Destination.js      # Mongoose model
├── public/
│   ├── index.html          # Frontend HTML
│   ├── styles.css          # Styling
│   └── script.js           # Frontend JavaScript
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── server.js               # Express server
└── README.md               # This file
```

## API Endpoints

- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/:id` - Get a specific destination
- `POST /api/destinations` - Create a new destination
- `PUT /api/destinations/:id` - Update a destination
- `DELETE /api/destinations/:id` - Delete a destination

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Add new travel destinations using the form
3. View, edit, or delete existing destinations

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Other**: dotenv for environment variables, cors for cross-origin requests

## License

This project is open source and available under the MIT License.