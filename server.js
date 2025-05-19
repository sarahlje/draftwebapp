// Load environment variables
require("dotenv").config();

// Import required packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View engine setup — must be before res.render()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route for homepage
app.get('/', (req, res) => {
  res.render('index', {
    focus: '',
    goal: '',
    duration: 30,
    equipment: []
  });
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import and use routes
const workoutRoutes = require('./routes/workout.js');
app.use('/api', workoutRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

