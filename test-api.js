//test-api.js

// This script tests the API endpoints directly
const fetch = require('node-fetch');

// Test parameters
const testParams = {
  focus: ['chest', 'arms'],
  goal: 'strength',
  equipment: ['bodyweight', 'dumbbells'],
  duration: 30,
  experience: 'beginner'
};

// Function to test the main API
async function testMainApi() {
  console.log("Testing main workout generation API...");
  try {
    const response = await fetch('http://localhost:5000/api/generate-workout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testParams)
    });
    
    const statusCode = response.status;
    console.log(`Status code: ${statusCode}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Main API successful!");
      console.log("Workout name:", data.name);
      console.log("Number of exercises:", data.exercises.length);
    } else {
      console.log("❌ Main API failed:");
      console.log(data);
    }
  } catch (error) {
    console.error("❌ Error testing main API:", error.message);
  }
}

// Function to test the fallback API
async function testFallbackApi() {
  console.log("\nTesting fallback workout generation API...");
  try {
    const response = await fetch('http://localhost:5000/api/generate-workout-fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testParams)
    });
    
    const statusCode = response.status;
    console.log(`Status code: ${statusCode}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Fallback API successful!");
      console.log("Workout name:", data.name);
      console.log("Number of exercises:", data.exercises.length);
    } else {
      console.log("❌ Fallback API failed:");
      console.log(data);
    }
  } catch (error) {
    console.error("❌ Error testing fallback API:", error.message);
  }
}

// Function to check diagnostic endpoint
async function checkDiagnostics() {
  console.log("\nChecking API diagnostics...");
  try {
    const response = await fetch('http://localhost:5000/api/diagnostics');
    const data = await response.json();
    console.log("Diagnostics results:");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("❌ Error checking diagnostics:", error.message);
  }
}

// Run all tests
async function runTests() {
  await testMainApi();
  await testFallbackApi();
  await checkDiagnostics();
}

runTests();