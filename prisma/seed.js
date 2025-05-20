// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exercises = [
    {
      name: 'Push-Up',
      description: 'A bodyweight chest and triceps exercise',
      muscleGroup: 'chest',
      equipment: ['bodyweight'],
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Keep your body straight and lower until elbows are at 90 degrees.',
      imageUrl: 'https://example.com/push-up.jpg',
    },
    {
      name: 'Dumbbell Bicep Curl',
      description: 'An isolation exercise for the biceps',
      muscleGroup: 'arms',
      equipment: ['dumbbells'],
      difficulty: 'beginner',
      category: 'strength',
      instructions: 'Keep elbows close to your body. Curl the weights slowly.',
      imageUrl: 'https://example.com/bicep-curl.jpg',
    },
    {
      name: 'Treadmill Run',
      description: 'A cardio workout on a treadmill',
      muscleGroup: 'legs',
      equipment: ['treadmill'],
      difficulty: 'intermediate',
      category: 'cardio',
      instructions: 'Set a moderate pace and maintain it for 20 minutes.',
      imageUrl: 'https://example.com/treadmill.jpg',
    }
  ];

  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    });
  }

  console.log('✅ Seed data inserted');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });