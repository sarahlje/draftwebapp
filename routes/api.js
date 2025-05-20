// routes/api.js - Fixed version with relaxed criteria

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET all exercises
router.get('/exercises', async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany();
    res.json(exercises);
  } catch (err) {
    console.error('Error fetching exercises:', err);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// POST generate a workout with much more relaxed criteria
router.post('/generate-workout', async (req, res) => {
  try {
    console.log("Received workout generation request:", req.body);
    
    const { focus, goal, equipment, duration, experience } = req.body;
    
    if (!focus || !goal || !equipment || !duration || !experience) {
      console.log("Missing required parameters:", { focus, goal, equipment, duration, experience });
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }

    // Convert duration to number
    const durationMinutes = parseInt(duration);
    
    // Validate that required arrays are not empty
    if (!Array.isArray(focus) || focus.length === 0 || !Array.isArray(equipment) || equipment.length === 0) {
      console.log("Arrays are empty or not arrays:", { 
        focusIsArray: Array.isArray(focus), 
        focusLength: Array.isArray(focus) ? focus.length : 'not array', 
        equipmentIsArray: Array.isArray(equipment), 
        equipmentLength: Array.isArray(equipment) ? equipment.length : 'not array' 
      });
      
      return res.status(400).json({ 
        error: 'At least one focus area and equipment type must be selected' 
      });
    }
    
    // First, check if we have any exercises in the database
    const exerciseCount = await prisma.exercise.count();
    console.log(`Total exercises in database: ${exerciseCount}`);
    
    if (exerciseCount === 0) {
      console.log("No exercises found in database. Using fallback exercises.");
      return res.status(200).json(generateFallbackWorkout(focus, goal, equipment, durationMinutes, experience));
    }

    // Get ALL exercises from the database regardless of criteria
    console.log("Getting all exercises without filtering");
    const allExercises = await prisma.exercise.findMany();
    
    if (allExercises.length === 0) {
      console.log("No exercises found even with relaxed criteria. Using fallback.");
      return res.status(200).json(generateFallbackWorkout(focus, goal, equipment, durationMinutes, experience));
    }
    
    // Create workout name
    const focusText = focus.includes('full_body') 
      ? 'Full Body' 
      : focus.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' & ');
    
    const goalText = {
      'strength': 'Strength',
      'cardio': 'Cardio',
      'general_fitness': 'Fitness'
    }[goal];
    
    const experienceText = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    }[experience];
    
    const workoutName = `${durationMinutes}-min ${experienceText} ${focusText} ${goalText} Workout`;
    
    // Process exercises - add sets and reps
    const processedExercises = allExercises.map(exercise => {
      const processedExercise = { ...exercise };
      
      // Add sets and reps based on goal and experience
      if (goal === 'strength') {
        // Strength-focused workout
        switch(experience) {
          case 'beginner':
            processedExercise.sets = 3;
            processedExercise.reps = '8-10';
            break;
          case 'intermediate':
            processedExercise.sets = 4;
            processedExercise.reps = '6-8';
            break;
          case 'advanced':
            processedExercise.sets = 5;
            processedExercise.reps = '4-6';
            break;
        }
      } else if (goal === 'cardio') {
        // Cardio-focused workout
        processedExercise.sets = 3;
        processedExercise.reps = '30-45 seconds';
      } else {
        // General fitness
        processedExercise.sets = 3;
        processedExercise.reps = '10-12';
      }
      
      // Add tips
      processedExercise.tips = [
        "Keep proper form throughout the exercise",
        "Breathe steadily during the movement",
        "Focus on controlled movements"
      ];
      
      return processedExercise;
    });
    
    // Limit to a reasonable number based on duration (roughly 1 exercise per 5 mins)
    const numberOfExercises = Math.max(3, Math.min(8, Math.floor(durationMinutes / 5)));
    
    // Shuffle the exercises to get a random selection
    const shuffledExercises = [...processedExercises].sort(() => Math.random() - 0.5);
    
    // Take just what we need
    const selectedExercises = shuffledExercises.slice(0, numberOfExercises);
    
    // Create the workout object
    const workout = {
      name: workoutName,
      duration: durationMinutes,
      goal: goal,
      focus: focus,
      experience: experience,
      equipment: equipment,
      exercises: selectedExercises
    };
    
    console.log(`Successfully generated workout with ${selectedExercises.length} exercises`);
    res.json(workout);
    
  } catch (err) {
    console.error('Error generating workout:', err);
    res.status(500).json({ error: 'Failed to generate workout: ' + err.message });
  }
});

// Fallback workout generator function
function generateFallbackWorkout(focus, goal, equipment, duration, experience) {
  console.log("Generating fallback workout");
  
  const fallbackExercises = [
    {
      id: 1,
      name: "Push-Up",
      description: "A bodyweight chest exercise",
      muscleGroup: "chest",
      equipment: "bodyweight",
      difficulty: "beginner",
      category: "strength",
      instructions: "Keep your body straight and lower until elbows are at 90 degrees, then push back up.",
      imageUrl: "/api/placeholder/150/150",
      isCompound: true,
      sets: 3,
      reps: "10-12",
      tips: [
        "Keep your core tight throughout the movement",
        "Don't let your hips sag",
        "Focus on full range of motion"
      ]
    },
    {
      id: 2,
      name: "Squat",
      description: "A lower body compound exercise",
      muscleGroup: "legs",
      equipment: "bodyweight",
      difficulty: "beginner",
      category: "strength",
      instructions: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then stand back up.",
      imageUrl: "/api/placeholder/150/150",
      isCompound: true,
      sets: 3,
      reps: "12-15",
      tips: [
        "Keep your weight in your heels",
        "Keep your chest up",
        "Push your knees outward as you descend"
      ]
    },
    {
      id: 3,
      name: "Plank",
      description: "A core stabilizing exercise",
      muscleGroup: "core",
      equipment: "bodyweight",
      difficulty: "beginner",
      category: "strength",
      instructions: "Hold a push-up position on your forearms, keeping your body in a straight line.",
      imageUrl: "/api/placeholder/150/150",
      isCompound: false,
      sets: 3,
      reps: "30 seconds",
      tips: [
        "Keep your core engaged",
        "Don't let your hips rise or sag",
        "Breathe steadily throughout the hold"
      ]
    },
    {
      id: 4,
      name: "Jumping Jacks",
      description: "A simple cardio exercise",
      muscleGroup: "full_body",
      equipment: "bodyweight",
      difficulty: "beginner",
      category: "cardio",
      instructions: "Jump while spreading your legs and raising your arms overhead, then jump back to the starting position.",
      imageUrl: "/api/placeholder/150/150",
      isCompound: true,
      sets: 3,
      reps: "45 seconds",
      tips: [
        "Keep a steady rhythm",
        "Land softly by bending your knees",
        "Breathe rhythmically with the movement"
      ]
    }
  ];

  // Create workout name
  const focusText = focus.includes('full_body') 
    ? 'Full Body' 
    : focus.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' & ');
  
  const goalText = {
    'strength': 'Strength',
    'cardio': 'Cardio',
    'general_fitness': 'Fitness'
  }[goal];
  
  const experienceText = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced'
  }[experience];
  
  const workoutName = `${duration}-min ${experienceText} ${focusText} ${goalText} Workout`;
  
  // Create the workout object
  return {
    name: workoutName,
    duration: duration,
    goal: goal,
    focus: focus,
    experience: experience,
    equipment: equipment,
    exercises: fallbackExercises
  };
}

// POST save preferences (now just a stub since we save to localStorage)
router.post('/save-preferences', async (req, res) => {
  // Just return success since preferences are saved locally
  res.json({ success: true, message: 'Preferences saved' });
});

module.exports = router;