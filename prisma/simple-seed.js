// prisma/simple-seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed script...');
  
  try {
    // Create a few basic exercises
    const exercises = [
      {
        name: 'Push-Up',
        description: 'A bodyweight chest exercise',
        muscleGroup: 'chest',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        category: 'strength',
        instructions: 'Keep your body straight and lower until elbows are at 90 degrees.',
        imageUrl: 'https://example.com/push-up.jpg',
        isCompound: true,
        estimatedTimeInMinutes: 3,
        tips: ['Keep core tight', 'Look slightly ahead']
      },
      {
        name: 'Squat',
        description: 'The king of leg exercises',
        muscleGroup: 'legs',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        category: 'strength',
        instructions: 'Stand with feet shoulder-width apart. Lower your body by bending your knees and hips.',
        imageUrl: 'https://example.com/squat.jpg',
        isCompound: true,
        estimatedTimeInMinutes: 3,
        tips: ['Keep weight on heels', 'Maintain neutral spine']
      },
      {
        name: 'Plank',
        description: 'Core stabilization exercise',
        muscleGroup: 'core',
        equipment: 'bodyweight',
        difficulty: 'beginner',
        category: 'strength',
        instructions: 'Hold a push-up position on your forearms.',
        imageUrl: 'https://example.com/plank.jpg',
        isCompound: false,
        estimatedTimeInMinutes: 2,
        tips: ['Keep body in straight line', 'Engage abs']
      }
    ];
    
    console.log(`Attempting to create ${exercises.length} exercises...`);
    
    for (const exercise of exercises) {
      console.log(`Creating exercise: ${exercise.name}`);
      await prisma.exercise.create({
        data: exercise
      });
      console.log(`Successfully created: ${exercise.name}`);
    }
    
    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error in seed script:');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });