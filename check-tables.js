// check-tables.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTables() {
  try {
    // Connect to the database directly to check table names
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('Existing tables in database:');
    console.log(tables);
    
    // Check if the Exercise table has data
    const exerciseCount = await prisma.exercise.count();
    console.log(`Number of exercises in database: ${exerciseCount}`);
    
    if (exerciseCount > 0) {
      const exercises = await prisma.exercise.findMany();
      console.log('Sample exercise:');
      console.log(exercises[0]);
    }
    
  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();