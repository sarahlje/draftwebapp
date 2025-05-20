const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all workouts
router.get('/workouts', async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany();
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// GET a specific workout
router.get('/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    res.json(workout);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workout' });
  }
});

// POST a new workout
router.post('/workouts', async (req, res) => {
  const { name, duration, goal, focus, experience, equipment, exercises, userId } = req.body;
  try {
    const newWorkout = await prisma.workout.create({
      data: { 
        name, 
        duration: parseInt(duration),
        goal,
        focus,
        experience,
        equipment,
        exercises,
        userId: userId ? parseInt(userId) : null
      },
    });
    res.status(201).json(newWorkout);
  } catch (err) {
    console.error('Error creating workout:', err);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

// DELETE a workout
router.delete('/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if workout exists
    const workout = await prisma.workout.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    
    // Delete the workout
    await prisma.workout.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Workout deleted successfully' });
  } catch (err) {
    console.error('Error deleting workout:', err);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

module.exports = router;