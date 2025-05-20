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

// Add debugging middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

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

// Import and use routes
const workoutRoutes = require('./routes/workout.js');
const apiRoutes = require('./routes/api.js');
const fallbackApiRoutes = require('./routes/fallback-api.js');

app.use('/api', workoutRoutes);
app.use('/api', apiRoutes);
app.use('/api', fallbackApiRoutes);

// API diagnostics route - useful for debugging
app.get('/api/diagnostics', async (req, res) => {
  try {
    // Check database connection
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'
    `;
    
    // Check tables
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    `;
    
    // Check exercise count
    let exerciseCount = 0;
    let sampleExercise = null;
    try {
      exerciseCount = await prisma.exercise.count();
      if (exerciseCount > 0) {
        sampleExercise = await prisma.exercise.findFirst();
      }
    } catch (e) {
      console.error("Error counting exercises:", e);
    }
    
    res.json({
      status: 'connected',
      databaseInfo: {
        tableCount: tableCount[0].count,
        tables: tables.map(t => t.table_name),
        exerciseCount,
        sampleExercise
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: PORT
      }
    });
  } catch (error) {
    console.error("Diagnostics error:", error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '(hidden in production)' : error.stack
    });
  }
});

// Error handler
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