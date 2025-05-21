// prisma/seed.js - Expanded Version
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Classification objects
  const muscleGroups = {
    CHEST: 'chest',
    BACK: 'back',
    LEGS: 'legs',
    ARMS: 'arms',
    SHOULDERS: 'shoulders',
    CORE: 'core',
    FULL_BODY: 'full_body',
    GLUTES: 'glutes',
    CARDIO: 'cardio'
  };
  
  const equipmentTypes = {
    BODYWEIGHT: 'bodyweight',
    DUMBBELLS: 'dumbbells',
    BARBELL: 'barbell',
    KETTLEBELLS: 'kettlebells',
    MACHINE: 'machine',
    CABLE: 'cable_machines',
    BENCH: 'bench',
    TREADMILL: 'treadmill',
    PULL_UP_BAR: 'pull_up_bar',
    ALL: 'all'
  };
  
  const categories = {
    STRENGTH: 'strength',
    CARDIO: 'cardio',
    COMPOUND: 'compound',
    ISOLATION: 'isolation',
    WARMUP: 'warmup',
    COOLDOWN: 'cooldown'
  };
  
  // Exercise data with proper exclusion flags
  const exercises = [
    // Chest exercises
    {
      name: 'Push-Up',
      description: 'A bodyweight chest, shoulders, and triceps exercise',
      muscleGroup: muscleGroups.CHEST,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.COMPOUND,
      instructions: 'Start in a plank position with hands shoulder-width apart. Keep your body straight and lower until elbows are at 90 degrees, then push back up.',
      imageUrl: 'https://example.com/push-up.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Dumbbell Bench Press',
      description: 'A chest and triceps exercise using dumbbells',
      muscleGroup: muscleGroups.CHEST,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.COMPOUND,
      instructions: 'Lie on a bench with a dumbbell in each hand at chest level. Press the weights upward until your arms are extended, then lower back to the starting position.',
      imageUrl: 'https://example.com/dumbbell-bench-press.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 5,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Barbell Bench Press',
      description: 'The classic chest and triceps exercise',
      muscleGroup: muscleGroups.CHEST,
      equipment: equipmentTypes.BARBELL,
      category: categories.COMPOUND,
      instructions: 'Lie on a bench with feet flat on the floor. Grip the barbell with hands slightly wider than shoulder-width. Unrack the bar, lower it to your mid-chest, then press back up to the starting position.',
      imageUrl: 'https://example.com/barbell-bench-press.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 5,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Incline Dumbbell Bench Press',
      description: 'Targets the upper chest with dumbbells',
      muscleGroup: muscleGroups.CHEST,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.COMPOUND,
      instructions: 'Set an adjustable bench to a 30-45 degree incline. Lie back with a dumbbell in each hand, press up until your arms are extended, then lower back to the starting position.',
      imageUrl: 'https://example.com/incline-dumbbell-press.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 5,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Cable Chest Fly',
      description: 'Isolation exercise for chest development',
      muscleGroup: muscleGroups.CHEST,
      equipment: equipmentTypes.CABLE,
      category: categories.ISOLATION,
      instructions: 'Stand between two cable machines with handles set at chest height. With a slight bend in your elbows, bring your hands together in front of your chest in an arcing motion.',
      imageUrl: 'https://example.com/cable-fly.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    
    // Back exercises
    {
      name: 'Pull-Up',
      description: 'Bodyweight back and biceps exercise',
      muscleGroup: muscleGroups.BACK,
      equipment: equipmentTypes.PULL_UP_BAR,
      category: categories.COMPOUND,
      instructions: 'Hang from a bar with hands slightly wider than shoulder-width. Pull yourself up until your chin is over the bar, then lower back to the starting position.',
      imageUrl: 'https://example.com/pull-up.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Bent-Over Row',
      description: 'Compound back and biceps exercise',
      muscleGroup: muscleGroups.BACK,
      equipment: equipmentTypes.BARBELL,
      category: categories.COMPOUND,
      instructions: 'Hinge at the hips with a slight bend in your knees, holding a barbell with hands shoulder-width apart. Pull the barbell to your lower ribcage, then lower it back down.',
      imageUrl: 'https://example.com/bent-over-row.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Seated Cable Row',
      description: 'Machine-based back exercise',
      muscleGroup: muscleGroups.BACK,
      equipment: equipmentTypes.CABLE,
      category: categories.COMPOUND,
      instructions: 'Sit at a cable row station with feet on the platform and knees slightly bent. Pull the handle to your abdomen, keeping your back straight, then slowly return to the starting position.',
      imageUrl: 'https://example.com/seated-cable-row.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Single-Arm Dumbbell Row',
      description: 'Unilateral back and lat exercise',
      muscleGroup: muscleGroups.BACK,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.COMPOUND,
      instructions: 'Place one knee and hand on a bench with the other foot on the floor. Hold a dumbbell in your free hand, pull it to your hip, then lower it back down.',
      imageUrl: 'https://example.com/single-arm-row.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Lat Pulldown',
      description: 'Machine-based exercise for the latissimus dorsi',
      muscleGroup: muscleGroups.BACK,
      equipment: equipmentTypes.CABLE,
      category: categories.COMPOUND,
      instructions: 'Sit at a lat pulldown machine with knees secured. Grasp the bar with hands wider than shoulder-width, pull it down to your upper chest, then slowly return to the starting position.',
      imageUrl: 'https://example.com/lat-pulldown.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    
    // Leg exercises
    {
      name: 'Squat',
      description: 'The king of leg exercises',
      muscleGroup: muscleGroups.LEGS,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.COMPOUND,
      instructions: 'Stand with feet shoulder-width apart. Lower your body by bending your knees and hips, as if sitting in a chair, then return to standing position.',
      imageUrl: 'https://example.com/squat.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Barbell Back Squat',
      description: 'Loaded squat variation with barbell',
      muscleGroup: muscleGroups.LEGS,
      equipment: equipmentTypes.BARBELL,
      category: categories.COMPOUND,
      instructions: 'Place a barbell across your upper back. Feet shoulder-width apart, lower your body by bending knees and hips until thighs are parallel to the floor, then return to standing.',
      imageUrl: 'https://example.com/back-squat.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 5,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Romanian Deadlift',
      description: 'Hip-hinge movement for hamstrings and lower back',
      muscleGroup: muscleGroups.LEGS,
      equipment: equipmentTypes.BARBELL,
      category: categories.COMPOUND,
      instructions: 'Hold a barbell at hip level. Keeping your back straight and knees slightly bent, hinge at the hips to lower the bar towards your feet, then return to standing.',
      imageUrl: 'https://example.com/romanian-deadlift.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Walking Lunge',
      description: 'Dynamic leg exercise that builds stability',
      muscleGroup: muscleGroups.LEGS,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.COMPOUND,
      instructions: 'Take a large step forward, lowering your back knee toward the ground. Push through your front heel to bring your back foot forward into the next lunge.',
      imageUrl: 'https://example.com/walking-lunge.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Leg Press',
      description: 'Machine-based leg compound exercise',
      muscleGroup: muscleGroups.LEGS,
      equipment: equipmentTypes.MACHINE,
      category: categories.COMPOUND,
      instructions: 'Sit in the leg press machine with feet shoulder-width on the platform. Release the safety and lower the platform by bending your knees, then push back to the starting position.',
      imageUrl: 'https://example.com/leg-press.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    
    // Shoulder exercises
    {
      name: 'Overhead Press',
      description: 'Compound shoulder exercise',
      muscleGroup: muscleGroups.SHOULDERS,
      equipment: equipmentTypes.BARBELL,
      category: categories.COMPOUND,
      instructions: 'Hold a barbell at shoulder height with hands just wider than shoulders. Press the bar overhead until arms are fully extended, then lower back to shoulders.',
      imageUrl: 'https://example.com/overhead-press.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Lateral Raise',
      description: 'Isolation exercise for side deltoids',
      muscleGroup: muscleGroups.SHOULDERS,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.ISOLATION,
      instructions: 'Stand with dumbbells at your sides. Raise the weights out to the sides until they reach shoulder level, then lower back down.',
      imageUrl: 'https://example.com/lateral-raise.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Face Pull',
      description: 'Posterior deltoid and upper back exercise',
      muscleGroup: muscleGroups.SHOULDERS,
      equipment: equipmentTypes.CABLE,
      category: categories.COMPOUND,
      instructions: 'Set a cable pulley to head height. Pull the rope towards your face, spreading your hands apart at the end of the movement, then return to the starting position.',
      imageUrl: 'https://example.com/face-pull.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    
    // Arm exercises
    {
      name: 'Dumbbell Bicep Curl',
      description: 'Isolation exercise for biceps',
      muscleGroup: muscleGroups.ARMS,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.ISOLATION,
      instructions: 'Stand with dumbbells in each hand. Keeping elbows close to your body, curl the weights up to shoulder level, then lower back down.',
      imageUrl: 'https://example.com/bicep-curl.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Tricep Dip',
      description: 'Bodyweight tricep exercise',
      muscleGroup: muscleGroups.ARMS,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.ISOLATION,
      instructions: 'Supporting yourself on parallel bars or a bench, lower your body by bending your elbows until they reach 90 degrees, then push back up.',
      imageUrl: 'https://example.com/tricep-dip.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Hammer Curl',
      description: 'Bicep and forearm exercise',
      muscleGroup: muscleGroups.ARMS,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.ISOLATION,
      instructions: 'Stand with dumbbells in each hand, palms facing your body. Curl the weights up while keeping your palms facing each other, then lower back down.',
      imageUrl: 'https://example.com/hammer-curl.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Tricep Pushdown',
      description: 'Isolation exercise for triceps',
      muscleGroup: muscleGroups.ARMS,
      equipment: equipmentTypes.CABLE,
      category: categories.ISOLATION,
      instructions: 'Stand at a cable machine with a straight or V-bar attachment. Push the bar down by extending your elbows until arms are straight, then return to the starting position.',
      imageUrl: 'https://example.com/tricep-pushdown.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    
    // Core exercises
    {
      name: 'Plank',
      description: 'Isometric core stabilization exercise',
      muscleGroup: muscleGroups.CORE,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.ISOLATION,
      instructions: 'Start in a push-up position, then lower onto your forearms. Keep your body in a straight line from head to heels, engaging your core muscles.',
      imageUrl: 'https://example.com/plank.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 2,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Russian Twist',
      description: 'Rotational core exercise',
      muscleGroup: muscleGroups.CORE,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.ISOLATION,
      instructions: 'Sit on the floor with knees bent. Lean back slightly, lift feet off the ground, and rotate your torso from side to side.',
      imageUrl: 'https://example.com/russian-twist.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 2,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Hanging Leg Raise',
      description: 'Advanced core exercise',
      muscleGroup: muscleGroups.CORE,
      equipment: equipmentTypes.PULL_UP_BAR,
      category: categories.ISOLATION,
      instructions: 'Hang from a pull-up bar. Keeping your legs straight, raise them until they are parallel to the ground or higher, then lower back down.',
      imageUrl: 'https://example.com/hanging-leg-raise.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    
    // Glute exercises
    {
      name: 'Hip Thrust',
      description: 'Targeted glute exercise',
      muscleGroup: muscleGroups.GLUTES,
      equipment: equipmentTypes.BARBELL,
      category: categories.ISOLATION,
      instructions: 'Sit on the ground with a bench behind you and a barbell over your hips. Lean back against the bench, then drive your hips up by squeezing your glutes, then lower back down.',
      imageUrl: 'https://example.com/hip-thrust.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 4,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Glute Bridge',
      description: 'Bodyweight glute exercise',
      muscleGroup: muscleGroups.GLUTES,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.ISOLATION,
      instructions: 'Lie on your back with knees bent and feet flat on the floor. Push through your heels to lift your hips off the ground, squeezing your glutes at the top, then lower back down.',
      imageUrl: 'https://example.com/glute-bridge.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    
    // Cardio exercises
    {
      name: 'Treadmill Run',
      description: 'Classic cardio exercise',
      muscleGroup: muscleGroups.CARDIO,
      equipment: equipmentTypes.TREADMILL,
      category: categories.CARDIO,
      instructions: 'Start with a 5-minute warm-up walk, then increase speed to a jog or run. Maintain for desired duration, then finish with a 5-minute cooldown walk.',
      imageUrl: 'https://example.com/treadmill.jpg',
      isCompound: false,
      estimatedTimeInMinutes: 15,
      excludeFromCardio: false,
      excludeFromStrength: true
    },
    {
      name: 'Jumping Jacks',
      description: 'Full body cardio movement',
      muscleGroup: muscleGroups.CARDIO,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.CARDIO,
      instructions: 'Stand with feet together and arms at your sides. Jump while spreading your legs and raising your arms overhead, then jump back to the starting position.',
      imageUrl: 'https://example.com/jumping-jacks.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 2,
      excludeFromCardio: false,
      excludeFromStrength: true
    },
    {
      name: 'Mountain Climbers',
      description: 'Dynamic cardio and core exercise',
      muscleGroup: muscleGroups.CARDIO,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.CARDIO,
      instructions: 'Start in a plank position. Alternate bringing each knee toward your chest in a running motion while keeping your hands on the ground.',
      imageUrl: 'https://example.com/mountain-climbers.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 2,
      excludeFromCardio: false,
      excludeFromStrength: true
    },
    {
      name: 'Burpee',
      description: 'Full body cardio exercise',
      muscleGroup: muscleGroups.FULL_BODY,
      equipment: equipmentTypes.BODYWEIGHT,
      category: categories.CARDIO,
      instructions: 'Start standing, then squat down and place hands on the floor. Jump feet back into a plank, perform a push-up, jump feet back to hands, then explosively jump up with arms overhead.',
      imageUrl: 'https://example.com/burpee.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: true
    },
    
    // Full body exercises
    {
      name: 'Deadlift',
      description: 'The ultimate full body exercise',
      muscleGroup: muscleGroups.FULL_BODY,
      equipment: equipmentTypes.BARBELL,
      category: categories.COMPOUND,
      instructions: 'Stand with feet hip-width apart and a barbell over your midfoot. Hinge at the hips to grip the bar, then stand up by extending your hips and knees, pulling the bar up along your legs.',
      imageUrl: 'https://example.com/deadlift.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 5,
      excludeFromCardio: true,
      excludeFromStrength: false
    },
    {
      name: 'Kettlebell Swing',
      description: 'Dynamic hip-hinge movement',
      muscleGroup: muscleGroups.FULL_BODY,
      equipment: equipmentTypes.KETTLEBELLS,
      category: categories.COMPOUND,
      instructions: 'Stand with feet shoulder-width apart and a kettlebell between your feet. Hinge at the hips to grip the kettlebell, then drive your hips forward to swing the weight up to chest level, then back between your legs.',
      imageUrl: 'https://example.com/kettlebell-swing.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    },
    {
      name: 'Thruster',
      description: 'Combination of front squat and overhead press',
      muscleGroup: muscleGroups.FULL_BODY,
      equipment: equipmentTypes.DUMBBELLS,
      category: categories.COMPOUND,
      instructions: 'Hold dumbbells at shoulder height. Squat down, then as you stand, use the momentum to press the weights overhead. Lower the weights back to shoulders as you squat again.',
      imageUrl: 'https://example.com/thruster.jpg',
      isCompound: true,
      estimatedTimeInMinutes: 3,
      excludeFromCardio: false,
      excludeFromStrength: false
    }
  ];
  
  // Create exercises in the database
  for (const exercise of exercises) {
    try {
      await prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {}, // Don't update existing exercises
        create: exercise
      });
      console.log(`✅ Added or skipped exercise: ${exercise.name}`);
    } catch (e) {
      console.error(`❌ Error with exercise ${exercise.name}:`, e.message);
    }
  }

  console.log(`✅ Seeded ${exercises.length} exercises`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });