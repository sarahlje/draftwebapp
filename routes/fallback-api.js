// routes/fallback-api.js

const express = require('express');
const router = express.Router();

// Fallback workout generator endpoint
router.post('/generate-workout-fallback', (req, res) => {
  try {
    console.log("Using fallback workout generator");
    const { focus, goal, equipment, duration, experience } = req.body;
    
    if (!focus || !goal || !equipment || !duration || !experience) {
      return res.status(400).json({ 
        error: 'Missing required parameters' 
      });
    }

    // Generate a simple workout without database access
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
    
    // Filter exercises based on focus areas
    let selectedExercises = fallbackExercises.filter(exercise => 
      focus.includes(exercise.muscleGroup) || exercise.muscleGroup === 'full_body'
    );
    
    // If no exercises match, use all exercises
    if (selectedExercises.length === 0) {
      selectedExercises = fallbackExercises;
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
    
    const workoutName = `${duration}-min ${experienceText} ${focusText} ${goalText} Workout`;
    
    // Create the workout object
    const workout = {
      name: workoutName,
      duration: parseInt(duration),
      goal: goal,
      focus: focus,
      experience: experience,
      equipment: equipment,
      exercises: selectedExercises
    };

    res.json(workout);
  } catch (err) {
    console.error('Error in fallback workout generator:', err);
    res.status(500).json({ error: 'Failed to generate workout: ' + err.message });
  }
});

module.exports = router;