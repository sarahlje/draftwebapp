// routes/api.js - Updated version with exercise family exclusion and compound-first ordering

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

// POST generate a workout
router.post('/generate-workout', async (req, res) => {
  try {
    console.log("Received workout generation request:", req.body);
    
    const { focus, goal, equipment, duration, style, blacklist } = req.body;
    
    if (!focus || !goal || !equipment || !duration) {
      console.log("Missing required parameters:", { focus, goal, equipment, duration });
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
    
    // Log blacklisted exercises
    const blacklistedExercises = blacklist || [];
    if (blacklistedExercises.length > 0) {
      console.log("Blacklisted exercises:", blacklistedExercises);
    }
    
    // First, check if we have any exercises in the database
    const exerciseCount = await prisma.exercise.count();
    console.log(`Total exercises in database: ${exerciseCount}`);
    
    if (exerciseCount === 0) {
      console.log("No exercises found in database. Using fallback exercises.");
      return res.status(200).json(generateFallbackWorkout(focus, goal, equipment, durationMinutes, style, blacklistedExercises));
    }

    // Get exercises that match the focus areas and equipment and respect exclusion flags
    console.log("Getting exercises that match focus areas:", focus);
    console.log("And equipment:", equipment);
    console.log("With goal:", goal);

    // Create equipment filter that ALWAYS includes bodyweight exercises
    let equipmentFilter;
    if (equipment.includes('all')) {
      // If "all" is selected, no equipment filter needed
      equipmentFilter = {};
    } else {
      // Always include bodyweight exercises, plus the selected equipment
      const equipmentWithBodyweight = [...new Set([...equipment, 'bodyweight'])]; // Use Set to avoid duplicates
      equipmentFilter = { equipment: { in: equipmentWithBodyweight } };
      console.log("Equipment filter (including bodyweight):", equipmentWithBodyweight);
    }

    let exerciseQuery = {
      where: {
        AND: [
          // Filter out exercises that should be excluded based on goal
          goal === 'cardio' ? { excludeFromCardio: false } : {},
          goal === 'strength' ? { excludeFromStrength: false } : {},
          // Add equipment filter
          equipmentFilter,
          // **NEW: Exclude blacklisted exercises**
          blacklistedExercises.length > 0 ? { name: { notIn: blacklistedExercises } } : {}
        ]
      }
    };

    if (focus.includes('full_body')) {
      // For full body workouts, get a mix of exercises from all major muscle groups
      console.log("Creating a full body workout with diverse exercises");
    } else {
      // For targeted workouts, match the specific muscle groups
      exerciseQuery.where.AND.push({ muscleGroup: { in: focus } });
    }

    console.log("Exercise query with blacklist:", JSON.stringify(exerciseQuery, null, 2));
    const allExercises = await prisma.exercise.findMany(exerciseQuery);

    // For full body workouts, ensure we have a balanced mix of exercises
    if (focus.includes('full_body') && allExercises.length > 0) {
      // Group exercises by muscle group
      const exercisesByMuscleGroup = {};
      
      allExercises.forEach(exercise => {
        if (!exercisesByMuscleGroup[exercise.muscleGroup]) {
          exercisesByMuscleGroup[exercise.muscleGroup] = [];
        }
        exercisesByMuscleGroup[exercise.muscleGroup].push(exercise);
      });
      
      console.log(`Found exercises for ${Object.keys(exercisesByMuscleGroup).length} different muscle groups`);
      
      // If we have enough muscle groups, create a balanced selection
      if (Object.keys(exercisesByMuscleGroup).length >= 3) {
        let balancedExercises = [];
        const mainMuscleGroups = ['chest', 'back', 'legs', 'core', 'arms', 'shoulders'];
        
        // First add exercises specifically tagged as full_body
        if (exercisesByMuscleGroup['full_body']) {
          // Add 1-2 full body exercises if available
          const fullBodyCount = Math.min(2, exercisesByMuscleGroup['full_body'].length);
          balancedExercises = balancedExercises.concat(
            exercisesByMuscleGroup['full_body']
              .sort(() => Math.random() - 0.5) // Shuffle
              .slice(0, fullBodyCount)
          );
        }
        
        // Then add at least one exercise from each major muscle group
        mainMuscleGroups.forEach(group => {
          if (exercisesByMuscleGroup[group] && exercisesByMuscleGroup[group].length > 0) {
            // Shuffle and take 1 exercise from this muscle group
            const shuffled = [...exercisesByMuscleGroup[group]].sort(() => Math.random() - 0.5);
            balancedExercises.push(shuffled[0]);
          }
        });
        
        // Replace allExercises with our balanced selection
        allExercises.length = 0;
        balancedExercises.forEach(ex => allExercises.push(ex));
        
        console.log(`Created balanced selection with ${allExercises.length} exercises`);
      }
    }

    if (allExercises.length === 0) {
      console.log("No exercises found after applying blacklist and filters. Using fallback.");
      return res.status(200).json(generateFallbackWorkout(focus, goal, equipment, durationMinutes, style, blacklistedExercises));
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
    
    const styleText = style === 'focus' ? 'Focus' : 'Variety';
    const workoutName = `${durationMinutes}-min ${focusText} ${goalText} Workout (${styleText})`;
    
    // Process exercises - add sets and reps BUT PRESERVE EXISTING TIPS
    const processedExercises = allExercises.map(exercise => {
      const processedExercise = { ...exercise };
      
      // Calculate sets based on goal, duration, and style
      if (goal === 'strength') {
        // Strength-focused workout
        if (style === 'focus') {
          // More sets for focus style
          processedExercise.sets = 4;
          processedExercise.reps = '6-8';
        } else {
          // Standard sets for variety style
          processedExercise.sets = 3;
          processedExercise.reps = '8-10';
        }
      } else if (goal === 'cardio') {
        // Cardio-focused workout - always use seconds for cardio
        if (style === 'focus') {
          // More sets for cardio focus
          processedExercise.sets = 4;
          processedExercise.reps = '40-50 seconds';
        } else {
          processedExercise.sets = 3;
          processedExercise.reps = '30-45 seconds';
        }
      } else {
        // General fitness
        // For cardio-category exercises, use seconds
        if (processedExercise.category === 'cardio') {
          if (style === 'focus') {
            processedExercise.sets = 4;
            processedExercise.reps = '30-40 seconds';
          } else {
            processedExercise.sets = 3;
            processedExercise.reps = '30-45 seconds';
          }
        } else {
          // For strength exercises in general fitness, use reps
          if (style === 'focus') {
            processedExercise.sets = 4;
            processedExercise.reps = '10-12';
          } else {
            processedExercise.sets = 3;
            processedExercise.reps = '10-15';
          }
        }
      }
      
      // PRESERVE EXISTING TIPS - only add generic tips if none exist
      if (!processedExercise.tips || processedExercise.tips.length === 0) {
        processedExercise.tips = [
          "Keep proper form throughout the exercise",
          "Breathe steadily during the movement",
          "Focus on controlled movements"
        ];
      }
      // If tips exist from database, keep them as-is
      
      return processedExercise;
    });
    
    // Limit exercises based on duration and style
    let numberOfExercises;
    if (style === 'focus') {
      // Focus: About 1 exercise per 12-15 minutes
      numberOfExercises = Math.max(2, Math.min(4, Math.floor(durationMinutes / 12)));
    } else {
      // Variety: About 1 exercise per 8-10 minutes  
      numberOfExercises = Math.max(3, Math.min(8, Math.floor(durationMinutes / 8)));
    }

    console.log(`Selecting ${numberOfExercises} exercises for a ${durationMinutes}-minute ${style} workout`);
    
    // **NEW: SMART EXERCISE SELECTION WITH FAMILY EXCLUSION AND COMPOUND-FIRST ORDERING**
    const selectedExercises = selectExercisesAvoidingDuplicates(
      processedExercises, 
      numberOfExercises, 
      goal
    );
    
    // Create the workout object
    const workout = {
      name: workoutName,
      duration: durationMinutes,
      goal: goal,
      focus: focus,
      style: style || 'variety',
      equipment: equipment,
      exercises: selectedExercises
    };
    
    console.log(`Successfully generated workout with ${selectedExercises.length} exercises`);
    if (blacklistedExercises.length > 0) {
      console.log(`Excluded ${blacklistedExercises.length} blacklisted exercises`);
    }
    console.log('Selected exercises with families:');
    selectedExercises.forEach((ex, index) => {
      console.log(`${index + 1}. ${ex.name} (family: ${ex.exerciseFamily || 'none'}, compound: ${ex.isCompound})`);
    });
    res.json(workout);
    
  } catch (err) {
    console.error('Error generating workout:', err);
    res.status(500).json({ error: 'Failed to generate workout: ' + err.message });
  }
});

/**
 * Smart exercise selection that avoids duplicates from the same family
 * AND maintains compound movements at the start of the workout
 */
function selectExercisesAvoidingDuplicates(exercises, targetCount, goal) {
  const selectedExercises = [];
  const usedFamilies = new Set();
  
  // Group exercises by family (including exercises without families)
  const exercisesByFamily = {};
  const exercisesWithoutFamily = [];
  
  exercises.forEach(exercise => {
    if (exercise.exerciseFamily) {
      if (!exercisesByFamily[exercise.exerciseFamily]) {
        exercisesByFamily[exercise.exerciseFamily] = [];
      }
      exercisesByFamily[exercise.exerciseFamily].push(exercise);
    } else {
      // Exercises without families are treated as unique
      exercisesWithoutFamily.push(exercise);
    }
  });
  
  console.log(`Found ${Object.keys(exercisesByFamily).length} exercise families and ${exercisesWithoutFamily.length} unique exercises`);
  
  // Separate compound and isolation exercises for ratio balancing
  const compoundFamilies = [];
  const isolationFamilies = [];
  const compoundUnique = [];
  const isolationUnique = [];
  
  // Categorize families by compound/isolation (based on majority)
  Object.entries(exercisesByFamily).forEach(([familyName, familyExercises]) => {
    const compoundCount = familyExercises.filter(ex => ex.isCompound).length;
    const isCompoundFamily = compoundCount > familyExercises.length / 2;
    
    if (isCompoundFamily) {
      compoundFamilies.push({ name: familyName, exercises: familyExercises });
    } else {
      isolationFamilies.push({ name: familyName, exercises: familyExercises });
    }
  });
  
  // Categorize unique exercises
  exercisesWithoutFamily.forEach(exercise => {
    if (exercise.isCompound) {
      compoundUnique.push(exercise);
    } else {
      isolationUnique.push(exercise);
    }
  });
  
  // Shuffle all arrays for randomness
  const shuffledCompoundFamilies = [...compoundFamilies].sort(() => Math.random() - 0.5);
  const shuffledIsolationFamilies = [...isolationFamilies].sort(() => Math.random() - 0.5);
  const shuffledCompoundUnique = [...compoundUnique].sort(() => Math.random() - 0.5);
  const shuffledIsolationUnique = [...isolationUnique].sort(() => Math.random() - 0.5);
  
  // Determine compound vs isolation ratio based on goal
  let compoundRatio;
  if (goal === 'strength') {
    compoundRatio = 0.7; // 70% compound for strength
  } else if (goal === 'cardio') {
    compoundRatio = 0.6; // 60% compound for cardio
  } else {
    compoundRatio = 0.6; // 60% compound for general fitness
  }
  
  const targetCompoundCount = Math.ceil(targetCount * compoundRatio);
  const targetIsolationCount = targetCount - targetCompoundCount;
  
  console.log(`Target: ${targetCompoundCount} compound, ${targetIsolationCount} isolation exercises`);
  
  // **COMPOUND EXERCISES FIRST** - for workout ordering
  const compoundExercises = [];
  let compoundSelected = 0;
  
  // Select from compound families (randomly pick one exercise from each family)
  for (const family of shuffledCompoundFamilies) {
    if (compoundSelected >= targetCompoundCount) break;
    
    // Randomly select one exercise from this family
    const randomExercise = family.exercises[Math.floor(Math.random() * family.exercises.length)];
    compoundExercises.push(randomExercise);
    usedFamilies.add(family.name);
    compoundSelected++;
    
    console.log(`Selected compound from ${family.name} family: ${randomExercise.name}`);
  }
  
  // Then, select from unique compound exercises
  for (const exercise of shuffledCompoundUnique) {
    if (compoundSelected >= targetCompoundCount) break;
    
    compoundExercises.push(exercise);
    compoundSelected++;
    
    console.log(`Selected unique compound: ${exercise.name}`);
  }
  
  // **ISOLATION EXERCISES SECOND** - for workout ordering
  const isolationExercises = [];
  let isolationSelected = 0;
  
  // Select from isolation families (randomly pick one exercise from each family)
  for (const family of shuffledIsolationFamilies) {
    if (isolationSelected >= targetIsolationCount) break;
    
    // Randomly select one exercise from this family
    const randomExercise = family.exercises[Math.floor(Math.random() * family.exercises.length)];
    isolationExercises.push(randomExercise);
    usedFamilies.add(family.name);
    isolationSelected++;
    
    console.log(`Selected isolation from ${family.name} family: ${randomExercise.name}`);
  }
  
  // Then, select from unique isolation exercises
  for (const exercise of shuffledIsolationUnique) {
    if (isolationSelected >= targetIsolationCount) break;
    
    isolationExercises.push(exercise);
    isolationSelected++;
    
    console.log(`Selected unique isolation: ${exercise.name}`);
  }
  
  // **MAINTAIN COMPOUND-FIRST ORDER**: Add compound exercises first, then isolation
  selectedExercises.push(...compoundExercises);
  selectedExercises.push(...isolationExercises);
  
  // If we still need more exercises, relax the family restriction
  if (selectedExercises.length < targetCount) {
    console.log(`Need ${targetCount - selectedExercises.length} more exercises, relaxing family restrictions...`);
    
    const remainingExercises = exercises.filter(ex => !selectedExercises.includes(ex));
    const shuffledRemaining = remainingExercises.sort(() => Math.random() - 0.5);
    
    for (const exercise of shuffledRemaining) {
      if (selectedExercises.length >= targetCount) break;
      
      selectedExercises.push(exercise);
      console.log(`Added additional: ${exercise.name} (family: ${exercise.exerciseFamily || 'none'})`);
    }
  }
  
  // Return exercises in compound-first order (no final shuffle)
  const finalSelection = selectedExercises.slice(0, targetCount);
  
  console.log(`Final selection: ${finalSelection.length} exercises`);
  console.log(`Families used: ${[...usedFamilies].join(', ')}`);
  console.log(`Order: Compound exercises first, then isolation exercises`);
  
  return finalSelection;
}

// Add the fallback endpoint
router.post('/generate-workout-fallback', async (req, res) => {
  try {
    const { focus, goal, equipment, duration, style, blacklist } = req.body;
    
    // Call the existing fallback function
    const workout = generateFallbackWorkout(focus, goal, equipment, parseInt(duration), style, blacklist || []);
    res.json(workout);
    
  } catch (err) {
    console.error('Error in fallback workout generation:', err);
    res.status(500).json({ error: 'Failed to generate fallback workout: ' + err.message });
  }
});

// Update the fallback workout generator to also prioritize compound movements and respect families
function generateFallbackWorkout(focus, goal, equipment, duration, style, blacklist = []) {
  console.log("Generating fallback workout with style:", style);
  console.log("Equipment selected:", equipment);
  console.log("Blacklisted exercises:", blacklist);
  
  // Define exercises by muscle group - now with proper isCompound flags and families
  const exercisesByMuscleGroup = {
    chest: [
      {
        id: 1,
        name: "Push-Up",
        description: "A bodyweight chest exercise",
        muscleGroup: "chest",
        equipment: "bodyweight",
        category: "strength",
        instructions: "Keep your body straight and lower until elbows are at 90 degrees, then push back up.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: true,
        exerciseFamily: "push_ups",
        sets: style === 'focus' ? 4 : 3,
        reps: "10-12",
        tips: [
          "Keep your core tight throughout the movement",
          "Don't let your hips sag",
          "Focus on full range of motion"
        ]
      }
    ],
    legs: [
      {
        id: 2,
        name: "Squat",
        description: "A lower body compound exercise",
        muscleGroup: "legs",
        equipment: "bodyweight",
        category: "strength",
        instructions: "Stand with feet shoulder-width apart, lower your body as if sitting in a chair, then stand back up.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: true,
        exerciseFamily: "squats",
        sets: style === 'focus' ? 4 : 3,
        reps: "12-15",
        tips: [
          "Keep your weight in your heels",
          "Keep your chest up",
          "Push your knees outward as you descend"
        ]
      },
      {
        id: 6,
        name: "Lunges",
        description: "Lower body exercise for legs and glutes",
        muscleGroup: "legs",
        equipment: "bodyweight",
        category: "strength",
        instructions: "Step forward with one leg, lowering your hips until both knees are bent at about 90 degrees.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: true,
        exerciseFamily: "lunges",
        sets: style === 'focus' ? 4 : 3,
        reps: "10-12 each leg",
        tips: [
          "Keep your upper body straight",
          "Step far enough forward for knee alignment",
          "Push back up using your front heel"
        ]
      }
    ],
    core: [
      {
        id: 3,
        name: "Plank",
        description: "A core stabilizing exercise",
        muscleGroup: "core",
        equipment: "bodyweight",
        category: "strength",
        instructions: "Hold a push-up position on your forearms, keeping your body in a straight line.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: false,
        exerciseFamily: "planks",
        sets: style === 'focus' ? 4 : 3,
        reps: "30 seconds",
        tips: [
          "Keep your core engaged",
          "Don't let your hips rise or sag",
          "Breathe steadily throughout the hold"
        ]
      }
    ],
    full_body: [
      {
        id: 4,
        name: "Jumping Jacks",
        description: "A simple cardio exercise",
        muscleGroup: "full_body",
        equipment: "bodyweight",
        category: "cardio",
        instructions: "Jump while spreading your legs and raising your arms overhead, then jump back to the starting position.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: true,
        exerciseFamily: "cardio_jumps",
        sets: style === 'focus' ? 4 : 3,
        reps: "45 seconds",
        tips: [
          "Keep a steady rhythm",
          "Land softly by bending your knees",
          "Breathe rhythmically with the movement"
        ]
      },
      {
        id: 5,
        name: "Mountain Climbers",
        description: "Dynamic cardio and core exercise",
        muscleGroup: "full_body",
        equipment: "bodyweight",
        category: "cardio",
        instructions: "Start in a plank position. Alternate bringing each knee toward your chest in a running motion.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: true,
        exerciseFamily: null, // Unique exercise
        sets: style === 'focus' ? 4 : 3,
        reps: "40 seconds",
        tips: [
          "Keep your hips stable",
          "Move your legs quickly for cardio effect",
          "Maintain proper plank position"
        ]
      },
      {
        id: 7,
        name: "Burpee",
        description: "Full body exercise combining a push-up and jump",
        muscleGroup: "full_body",
        equipment: "bodyweight",
        category: "cardio",
        instructions: "Start standing, drop to a squat, kick feet back to plank, do a push-up, return to squat, then jump up.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: true,
        exerciseFamily: "burpees",
        sets: style === 'focus' ? 3 : 2,
        reps: "10-12",
        tips: [
          "Modify by removing the push-up if needed",
          "Focus on form over speed",
          "Jump explosively at the top"
        ]
      }
    ],
    back: [
      {
        id: 8,
        name: "Superman Hold",
        description: "Back strengthening exercise",
        muscleGroup: "back",
        equipment: "bodyweight",
        category: "strength",
        instructions: "Lie face down with arms extended forward. Lift arms, chest, and legs off the ground simultaneously.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: false,
        exerciseFamily: null, // Unique exercise
        sets: style === 'focus' ? 4 : 3,
        reps: "20-30 seconds",
        tips: [
          "Focus on lifting through your back, not just arms and legs",
          "Keep your neck neutral",
          "Breathe steadily throughout"
        ]
      }
    ],
    arms: [
      {
        id: 9,
        name: "Tricep Dips",
        description: "Arm exercise focusing on triceps",
        muscleGroup: "arms",
        equipment: "bodyweight",
        category: "strength",
        instructions: "Use a chair or bench, place hands on edge with fingers forward, lower body by bending elbows.",
        imageUrl: "/api/placeholder/150/150",
        isCompound: false,
        exerciseFamily: null, // Unique exercise
        sets: style === 'focus' ? 4 : 3,
        reps: "10-12",
        tips: [
          "Keep elbows pointed straight back",
          "Keep shoulders down away from ears",
          "Go as deep as comfortable"
        ]
      }
    ]
  };

  // Create workout name
  const focusText = focus.includes('full_body') 
    ? 'Full Body' 
    : focus.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' & ');
  
  const goalText = {
    'strength': 'Strength',
    'cardio': 'Cardio',
    'general_fitness': 'Fitness'
  }[goal];
  
  const styleText = style === 'focus' ? 'Focus' : 'Variety';
  const workoutName = `${duration}-min ${focusText} ${goalText} Workout (${styleText})`;
  
  // Determine how many exercises to include based on duration and style
  let exerciseCount;
  if (style === 'focus') {
    exerciseCount = Math.max(3, Math.min(4, Math.floor(duration / 10)));
  } else {
    exerciseCount = Math.max(4, Math.min(8, Math.floor(duration / 7)));
  }
  
  // Select exercises based on focus
  let allExercises = [];
  
  if (focus.includes('full_body')) {
    // For full body workouts, include exercises from various muscle groups
    const muscleGroups = Object.keys(exercisesByMuscleGroup);
    muscleGroups.forEach(group => {
      if (exercisesByMuscleGroup[group]) {
        allExercises = allExercises.concat(exercisesByMuscleGroup[group]);
      }
    });
  } else {
    // For targeted workouts, use exercises from the requested focus areas
    const targetGroups = focus.filter(f => exercisesByMuscleGroup[f]);
    targetGroups.forEach(group => {
      if (exercisesByMuscleGroup[group]) {
        allExercises = allExercises.concat(exercisesByMuscleGroup[group]);
      }
    });
  }
  
  // **Filter out blacklisted exercises from fallback**
  allExercises = allExercises.filter(exercise => !blacklist.includes(exercise.name));
  
  // **Apply family-aware selection with compound-first ordering to fallback workouts**
  const selectedExercises = selectExercisesAvoidingDuplicates(allExercises, exerciseCount, goal);
  
  // Create the workout object
  return {
    name: workoutName,
    duration: duration,
    goal: goal,
    focus: focus,
    style: style || 'variety',
    equipment: equipment,
    exercises: selectedExercises
  };
}

// POST save preferences (now just a stub since we save to localStorage)
router.post('/save-preferences', async (req, res) => {
  // Just return success since preferences are saved locally
  res.json({ success: true, message: 'Preferences saved' });
});

module.exports = router;