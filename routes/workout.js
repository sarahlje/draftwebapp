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

// POST a new workout
router.post('/workouts', async (req, res) => {
  const { name, duration } = req.body;
  try {
    const newWorkout = await prisma.workout.create({
      data: { name, duration: Number(duration) },
    });
    res.status(201).json(newWorkout);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

module.exports = router;