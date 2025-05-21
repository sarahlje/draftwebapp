// fix-seed.js
// Run this script to automatically modify your seed.js file

const fs = require('fs');
const path = require('path');

// Path to your seed file
const seedFilePath = path.join(__dirname, 'prisma', 'seed.js');

// Read the seed file
fs.readFile(seedFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading seed file:', err);
    return;
  }

  // Define the exercise categories for cardio and strength
  const cardioExercises = [
    'Treadmill Run',
    'Jumping Jacks',
    'Mountain Climbers',
    'Burpee'
  ];

  const strengthExercises = [
    'Deadlift',
    'Barbell Bench Press',
    'Barbell Back Squat',
    'Overhead Press',
    'Romanian Deadlift'
  ];

  // Replace difficulty field in exercise objects
  // This regex looks for the difficulty field and removes it
  let modifiedData = data.replace(/difficulty:\s*.*?difficulties\.[A-Z_]+,\s*\n/g, '');

  // Add excludeFromStrength and excludeFromCardio fields where appropriate
  // Find all exercise objects
  const exerciseRegex = /{\s*name:\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = exerciseRegex.exec(data)) !== null) {
    const exerciseName = match[1];
    const position = match.index;
    
    // Find the end of the object (assuming proper formatting)
    const objectEndRegex = /estimatedTimeInMinutes:\s*\d+/g;
    objectEndRegex.lastIndex = position;
    const endMatch = objectEndRegex.exec(data);
    
    if (endMatch) {
      const endPosition = endMatch.index + endMatch[0].length;
      
      // Add the excludeFromCardio and excludeFromStrength properties
      let insertText = '';
      
      if (strengthExercises.includes(exerciseName)) {
        insertText += ',\n      excludeFromCardio: true';
      } else {
        insertText += ',\n      excludeFromCardio: false';
      }
      
      if (cardioExercises.includes(exerciseName)) {
        insertText += ',\n      excludeFromStrength: true';
      } else {
        insertText += ',\n      excludeFromStrength: false';
      }
      
      // Insert the new properties
      modifiedData = modifiedData.substring(0, endPosition) + insertText + modifiedData.substring(endPosition);
      
      // Adjust the regex lastIndex to account for the inserted text
      exerciseRegex.lastIndex += insertText.length;
    }
  }

  // Write the modified data back to the file
  fs.writeFile(seedFilePath + '.fixed', modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing modified seed file:', err);
      return;
    }
    console.log('Seed file updated successfully. New file saved as:', seedFilePath + '.fixed');
    console.log('Please review the changes before replacing your original seed file.');
  });
});