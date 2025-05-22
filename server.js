// Load environment variables
require("dotenv").config();

// Import required packages
const express = require('express');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

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

// View engine setup
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

// Route for about page
app.get('/about', (req, res) => {
  res.render('about');
});

// Import and use routes
const workoutRoutes = require('./routes/workout.js');
const apiRoutes = require('./routes/api.js');

app.use('/api', workoutRoutes);
app.use('/api', apiRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Disconnected from database');
  process.exit(0);
});