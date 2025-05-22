// update-all-exercise-tips.js
// Comprehensive script to add tips to all exercises

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exerciseTips = {
  'Push-Up': [
    'Keep your core tight throughout the movement',
    'Don\'t let your hips sag',
    'Focus on full range of motion',
    'Keep your body in a straight line'
  ],
  'Dumbbell Bench Press': [
    'Keep your feet flat on the floor',
    'Lower the dumbbells to chest level',
    'Press up in a controlled motion',
    'Keep your core engaged throughout'
  ],
  'Barbell Bench Press': [
    'Keep your feet firmly planted on the ground',
    'Maintain a slight arch in your back',
    'Lower the bar to your mid-chest',
    'Keep your wrists straight and grip firm'
  ],
  'Incline Dumbbell Bench Press': [
    'Set the bench to 30-45 degrees',
    'Keep your back against the bench',
    'Press up and slightly back',
    'Don\'t let dumbbells drift too wide'
  ],
  'Cable Chest Fly': [
    'Keep a slight bend in your elbows',
    'Focus on squeezing your chest muscles',
    'Control the weight on the return',
    'Don\'t let cables pull you forward'
  ],
  'Pull-Up': [
    'Engage your lats and pull with your back',
    'Keep your core tight',
    'Don\'t swing or use momentum',
    'Pull until your chin is over the bar'
  ],
  'Barbell Bent-Over Row': [
    'Keep your back straight and core engaged',
    'Pull the bar to your lower ribcage',
    'Squeeze your shoulder blades together',
    'Don\'t use momentum to lift the weight'
  ],
  'Seated Cable Row': [
    'Keep your back straight throughout',
    'Pull to your lower chest/upper abdomen',
    'Don\'t lean back excessively',
    'Focus on squeezing your shoulder blades'
  ],
  'Single-Arm Dumbbell Row': [
    'Keep your back parallel to the floor',
    'Pull the dumbbell to your hip',
    'Don\'t rotate your torso',
    'Feel the squeeze in your lat muscle'
  ],
  'Lat Pulldown': [
    'Lean back slightly for better angle',
    'Pull to your upper chest, not behind neck',
    'Focus on using your lats, not arms',
    'Control the weight on the way up'
  ],
  'Bodyweight Squat': [
    'Keep your weight in your heels',
    'Keep your chest up and core engaged',
    'Push your knees outward as you descend',
    'Go down until thighs are parallel to the floor'
  ],
  'Barbell Back Squat': [
    'Keep the bar positioned on your upper back',
    'Maintain a straight back throughout',
    'Drive through your heels',
    'Keep your knees tracking over your toes'
  ],
  'Barbell Romanian Deadlift': [
    'Hinge at the hips, not the knees',
    'Keep a slight bend in your knees',
    'Lower the bar by pushing your hips back',
    'Feel the stretch in your hamstrings'
  ],
  'Bodyweight Walking Lunge': [
    'Keep your upper body straight',
    'Step far enough forward for proper knee alignment',
    'Push back up using your front heel',
    'Alternate legs with each rep'
  ],
  'Leg Press': [
    'Place feet shoulder-width apart on platform',
    'Don\'t let your knees cave inward',
    'Control the weight on the way down',
    'Don\'t lock out your knees completely'
  ],
  'Barbell Overhead Press': [
    'Keep your core tight to protect your lower back',
    'Press the bar straight up over your head',
    'Keep your elbows slightly forward',
    'Don\'t lean back excessively'
  ],
  'Lateral Raise': [
    'Use controlled movements, don\'t swing',
    'Lift to shoulder height, no higher',
    'Keep a slight bend in your elbows',
    'Focus on lifting with your side delts'
  ],
  'Face Pull': [
    'Pull the rope to your face level',
    'Separate your hands at the end',
    'Focus on your rear delts',
    'Keep your elbows high'
  ],
  'Dumbbell Bicep Curl': [
    'Keep your elbows close to your body',
    'Don\'t swing or use momentum',
    'Control the weight on the way down',
    'Squeeze your biceps at the top'
  ],
  'Tricep Dip': [
    'Keep elbows pointed straight back',
    'Keep shoulders down away from ears',
    'Go as deep as comfortable',
    'Don\'t let your shoulders roll forward'
  ],
  'Hammer Curl': [
    'Keep palms facing each other',
    'Don\'t swing your arms',
    'Control the movement both ways',
    'Keep your elbows stationary'
  ],
  'Tricep Pushdown': [
    'Keep your elbows at your sides',
    'Squeeze your triceps at the bottom',
    'Don\'t lean forward',
    'Control the weight on the way back up'
  ],
  'Low Plank': [
    'Keep your body in a straight line',
    'Don\'t let your hips sag or rise',
    'Breathe steadily throughout',
    'Keep your shoulders over your elbows'
  ],
  'Russian Twist': [
    'Keep your core engaged throughout',
    'Don\'t rush the movement',
    'Touch the ground on each side',
    'Keep your feet off the ground for added difficulty'
  ],
  'Hanging Leg Raise': [
    'Don\'t swing your body',
    'Use your abs to lift your legs',
    'Control the movement on the way down',
    'Keep your shoulders engaged'
  ],
  'Barbell Hip Thrust': [
    'Squeeze your glutes at the top',
    'Keep your core engaged',
    'Don\'t hyperextend your back',
    'Drive through your heels'
  ],
  'Glute Bridge': [
    'Squeeze your glutes at the top',
    'Keep your core tight',
    'Don\'t arch your back excessively',
    'Hold the top position briefly'
  ],
  'Treadmill Run': [
    'Start with a warm-up walk',
    'Land on the balls of your feet',
    'Keep your posture upright',
    'Breathe rhythmically'
  ],
  'Jumping Jacks': [
    'Keep a steady rhythm',
    'Land softly by bending your knees',
    'Breathe rhythmically with the movement',
    'Keep your core engaged throughout'
  ],
  'Mountain Climbers': [
    'Keep your hips stable and level',
    'Move your legs quickly for cardio effect',
    'Maintain proper plank position',
    'Don\'t let your hips bounce up and down'
  ],
  'Burpee': [
    'Modify by removing the push-up if needed',
    'Focus on form over speed',
    'Jump explosively at the top',
    'Land softly to protect your joints'
  ],
  'Barbell Deadlift': [
    'Keep the bar close to your body',
    'Engage your lats to protect your back',
    'Drive through your heels',
    'Keep your back straight throughout the movement'
  ],
  'Kettlebell Swing': [
    'Drive the movement with your hips',
    'Keep your arms relaxed',
    'Don\'t squat, hinge at the hips',
    'Squeeze your glutes at the top'
  ],
  'Dumbbell Thruster': [
    'Keep the weights at shoulder level',
    'Use your legs to drive the press',
    'Keep your core engaged',
    'Combine squat and press smoothly'
  ],
  'Dumbbell Skullcrusher': [
    'Keep your elbows stationary',
    'Only move your forearms',
    'Control the weight carefully',
    'Don\'t let elbows flare out'
  ],
  'Dumbbell Fly': [
    'Keep a slight bend in your elbows',
    'Feel the stretch in your chest',
    'Don\'t go too low and risk injury',
    'Focus on squeezing your chest muscles'
  ],
  'Goblet Squat': [
    'Hold the weight close to your chest',
    'Keep your elbows pointing down',
    'Sit back into the squat',
    'Keep your torso upright'
  ],
  'Renegade Row': [
    'Keep your hips stable',
    'Don\'t rotate your body',
    'Maintain plank position',
    'Row one arm at a time'
  ],
  'Dumbbell Bent-Over Row': [
    'Keep your back straight',
    'Pull to your lower ribcage',
    'Don\'t use momentum',
    'Squeeze your shoulder blades'
  ],
  'Dumbbell Overhead Press': [
    'Keep your core tight',
    'Press straight up overhead',
    'Don\'t arch your back excessively',
    'Control the weight on the way down'
  ],
  'Dumbbell Clean': [
    'Start with weights at your sides',
    'Use explosive hip drive',
    'Catch the weights at shoulder level',
    'Keep your core engaged throughout'
  ],
  'Devil\'s Press': [
    'Combine burpee with overhead press',
    'Use explosive movement',
    'Keep dumbbells close to body',
    'Focus on full-body coordination'
  ],
  'Tricep Kickback': [
    'Keep your upper arm parallel to floor',
    'Only move your forearm',
    'Squeeze your triceps at extension',
    'Don\'t swing your arm'
  ],
  'Squat Jump': [
    'Land softly with bent knees',
    'Jump explosively from squat position',
    'Keep your chest up',
    'Use your arms for momentum'
  ],
  'Jump Lunge': [
    'Switch legs in mid-air',
    'Land softly in lunge position',
    'Keep your torso upright',
    'Use explosive movement'
  ],
  'Scissor Kicks': [
    'Keep your lower back pressed to floor',
    'Keep legs straight',
    'Control the movement',
    'Don\'t let feet touch the ground'
  ],
  'Bench Step-Up': [
    'Step up with full foot on bench',
    'Drive through your heel',
    'Control the step down',
    'Keep your torso upright'
  ],
  'Dumbbell Lat Pullover': [
    'Keep a slight bend in your elbows',
    'Feel the stretch in your lats',
    'Don\'t go too far behind your head',
    'Control the movement both ways'
  ],
  'Froggers': [
    'Keep your hands planted',
    'Jump feet to outside of hands',
    'Keep your chest up',
    'Land softly on your feet'
  ],
  'Crunches': [
    'Keep your lower back on the ground',
    'Don\'t pull on your neck',
    'Focus on lifting with your abs',
    'Control the movement down'
  ],
  'Dumbbell Crunches': [
    'Hold weight across your chest',
    'Don\'t let weight pull you up',
    'Focus on ab contraction',
    'Keep your feet planted'
  ],
  'Jackknives': [
    'Keep your legs straight',
    'Reach for your toes',
    'Control the movement',
    'Feel the burn in your abs'
  ],
  'Gorilla Row': [
    'Keep dumbbells on the ground',
    'Row one weight at a time',
    'Keep your hips hinged',
    'Don\'t rotate your torso'
  ],
  'Kettlebell Goblet Squat': [
    'Hold kettlebell at your chest',
    'Keep elbows pointing down',
    'Sit back into the squat',
    'Drive through your heels'
  ],
  'Dumbbell Clean and Press': [
    'Use explosive hip drive',
    'Catch weights at shoulders',
    'Press overhead immediately',
    'Keep core engaged throughout'
  ],
  'Bulgarian Split Squat': [
    'Keep most weight on front leg',
    'Don\'t bounce at the bottom',
    'Keep your torso upright',
    'Control the movement both ways'
  ],
  'Dumbbell Romanian Deadlift': [
    'Hinge at the hips',
    'Keep dumbbells close to legs',
    'Feel stretch in hamstrings',
    'Don\'t round your back'
  ],
  'Plank Up-Down': [
    'Keep your hips stable',
    'Don\'t rock side to side',
    'Alternate leading arms',
    'Maintain plank position'
  ],
  'Reverse Lunge': [
    'Step back, not forward',
    'Keep most weight on front leg',
    'Don\'t let knee touch ground',
    'Push through front heel to return'
  ],
  'Dumbbell Reverse Lunge': [
    'Hold weights at your sides',
    'Step back into lunge',
    'Keep your torso upright',
    'Control the movement'
  ],
  'Dumbbell Snatch': [
    'Start with weight between legs',
    'Use explosive hip drive',
    'Catch overhead in one motion',
    'Keep the weight close to body'
  ],
  'Barbell Reverse Lunge': [
    'Keep bar secure on your back',
    'Step back into lunge position',
    'Keep your torso upright',
    'Drive through front heel'
  ],
  'Dumbbell Power Jacks': [
    'Hold weights at shoulder level',
    'Jump feet apart and together',
    'Keep weights stable',
    'Land softly on your feet'
  ],
  'Kettlebell Deadlift': [
    'Keep kettlebell close to body',
    'Hinge at the hips',
    'Drive through your heels',
    'Keep your back straight'
  ],
  'Plank Jacks': [
    'Keep your upper body stable',
    'Jump feet apart and together',
    'Maintain plank position',
    'Don\'t let hips bounce'
  ],
  'Dumbbell Push Press': [
    'Use leg drive to start press',
    'Keep core engaged',
    'Press weights overhead',
    'Land softly after leg drive'
  ],
  'Barbell Push Press': [
    'Use explosive leg drive',
    'Keep bar path straight',
    'Press overhead quickly',
    'Control the descent'
  ],
  'Dumbbell High Pull': [
    'Pull weights to chest level',
    'Keep elbows high',
    'Use explosive hip drive',
    'Don\'t lean back'
  ],
  'Barbell High Pull': [
    'Pull bar to chest level',
    'Keep bar close to body',
    'Use explosive movement',
    'Keep elbows high'
  ],
  'Rear Delt Fly': [
    'Keep slight bend in elbows',
    'Focus on rear deltoids',
    'Don\'t use momentum',
    'Squeeze shoulder blades together'
  ],
  'Side Lunge': [
    'Keep one leg straight',
    'Sit back into the lunge',
    'Keep your chest up',
    'Push through heel to return'
  ],
  'Bench Toe Taps': [
    'Keep your core engaged',
    'Alternate feet quickly',
    'Stay on balls of feet',
    'Keep your chest up'
  ],
  'High Knees': [
    'Drive knees up to waist level',
    'Stay on balls of feet',
    'Keep arms pumping',
    'Maintain good posture'
  ],
  'Sit Up': [
    'Keep feet planted on ground',
    'Don\'t pull on your neck',
    'Come up to sitting position',
    'Control the descent'
  ],
  'Weighted Sit Up': [
    'Hold weight across chest',
    'Don\'t let weight pull you',
    'Control the movement',
    'Focus on ab contraction'
  ],
  'Bicycle Crunch': [
    'Don\'t pull on your neck',
    'Bring opposite elbow to knee',
    'Keep unused leg extended',
    'Control the movement'
  ],
  'Burpee Broad Jump': [
    'Combine burpee with forward jump',
    'Land softly after jump',
    'Focus on explosive power',
    'Keep good form throughout'
  ],
  'Lying Leg Raises': [
    'Keep lower back pressed down',
    'Don\'t let feet touch ground',
    'Control the movement down',
    'Keep legs straight'
  ],
  'Reverse Crunches': [
    'Bring knees to chest',
    'Lift hips off the ground',
    'Control the movement',
    'Don\'t use momentum'
  ],
  'Side Plank Dips': [
    'Keep body in straight line',
    'Dip hip toward ground',
    'Control the movement',
    'Don\'t let hips sag'
  ],
  'Kettlebell Clean and Press': [
    'Use explosive hip drive',
    'Catch at shoulder level',
    'Press overhead immediately',
    'Keep kettlebell close to body'
  ],
  'Spiderman Push-Up': [
    'Bring knee to elbow as you descend',
    'Keep core engaged',
    'Alternate sides',
    'Maintain push-up form'
  ],
  'Superman': [
    'Lift chest and legs simultaneously',
    'Hold the top position',
    'Don\'t strain your neck',
    'Focus on back muscles'
  ],
  'Tricep Overhead Extension': [
    'Keep elbows close to head',
    'Only move your forearms',
    'Control the weight',
    'Don\'t let elbows flare'
  ],
  'Tuck Jump': [
    'Pull knees to chest',
    'Jump as high as possible',
    'Land softly with bent knees',
    'Use explosive power'
  ],
  'Pike Push-Up': [
    'Keep hips high in pike position',
    'Lower head toward ground',
    'Focus on shoulders',
    'Keep legs straight'
  ],
  'Back Extensions': [
    'Lift chest off pad',
    'Don\'t hyperextend',
    'Control the movement',
    'Focus on lower back muscles'
  ],
  'Seated Hamstring Curl': [
    'Keep your back against pad',
    'Control the weight down',
    'Feel stretch in hamstrings',
    'Don\'t use momentum'
  ],
  'Sumo Squat': [
    'Stand with wide stance',
    'Point toes slightly outward',
    'Keep knees over toes',
    'Sit back into the squat'
  ],
  'Dumbbell Sumo Squat': [
    'Hold weight between legs',
    'Keep wide stance',
    'Squat straight down',
    'Drive through heels'
  ],
  '180 Squat Jump': [
    'Jump and rotate 180 degrees',
    'Land softly in squat',
    'Keep chest up throughout',
    'Use explosive power'
  ],
  'Skaters': [
    'Leap from side to side',
    'Land on one foot',
    'Keep low throughout',
    'Use arms for balance'
  ],
  'Kettlebell Halo': [
    'Keep core engaged',
    'Circle kettlebell around head',
    'Control the movement',
    'Alternate directions'
  ],
  'Dumbbell Single Leg Deadlift': [
    'Balance on one leg',
    'Hinge at the hip',
    'Keep back straight',
    'Feel stretch in hamstring'
  ],
  'Arnold Press': [
    'Start with palms facing you',
    'Rotate as you press up',
    'Control the movement',
    'Work through full range'
  ],
  'Dumbbell Close Grip Press': [
    'Keep dumbbells close together',
    'Focus on triceps',
    'Control the descent',
    'Don\'t let elbows flare'
  ],
  'Dumbbell Skier Swing': [
    'Swing arms like skiing motion',
    'Keep core engaged',
    'Use explosive movement',
    'Coordinate arms and legs'
  ],
  'Barbell Skullcrusher': [
    'Keep elbows stationary',
    'Lower bar to forehead',
    'Control the movement',
    'Focus on tricep extension'
  ]
};

async function updateAllExerciseTips() {
  try {
    console.log('Starting comprehensive exercise tips update...');
    console.log(`Processing ${Object.keys(exerciseTips).length} exercises`);
    
    let successCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    
    for (const [exerciseName, tips] of Object.entries(exerciseTips)) {
      try {
        const result = await prisma.exercise.updateMany({
          where: { name: exerciseName },
          data: { tips: tips }
        });
        
        if (result.count > 0) {
          console.log(`✅ Updated tips for: ${exerciseName}`);
          successCount++;
        } else {
          console.log(`⚠️  Exercise not found: ${exerciseName}`);
          notFoundCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating ${exerciseName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 Update Summary:');
    console.log(`✅ Successfully updated: ${successCount} exercises`);
    console.log(`⚠️  Not found: ${notFoundCount} exercises`);
    console.log(`❌ Errors: ${errorCount} exercises`);
    console.log('\n🎉 Exercise tips update completed!');
    
  } catch (error) {
    console.error('Error updating exercise tips:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Also provide a function to see which exercises exist in your database
async function listExistingExercises() {
  try {
    const exercises = await prisma.exercise.findMany({
      select: { name: true },
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Exercises in your database:');
    exercises.forEach((exercise, index) => {
      console.log(`${index + 1}. ${exercise.name}`);
    });
    
    console.log(`\nTotal: ${exercises.length} exercises found`);
    
  } catch (error) {
    console.error('Error listing exercises:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the functions
console.log('Choose an option:');
console.log('1. Update all exercise tips');
console.log('2. List existing exercises in database');

const args = process.argv.slice(2);
if (args[0] === 'list') {
  listExistingExercises();
} else {
  updateAllExerciseTips();
}