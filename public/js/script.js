// Load data and setup on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadExerciseDatabase();
    loadPreferences();
    setupEventListeners();
    
    // Check if we should show saved workouts based on URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('show') === 'saved') {
        // Wait a bit for the page to load, then show saved workouts
        setTimeout(() => {
            const savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
            if (savedWorkouts.length > 0) {
                if (!document.getElementById('view-saved-workouts-btn')) {
                    createSavedWorkoutsSection();
                }
                toggleSavedWorkouts();
                
                // Scroll to saved workouts section
                setTimeout(() => {
                    const savedSection = document.querySelector('.saved-workouts-container');
                    if (savedSection) {
                        savedSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 200);
            }
        }, 500);
    }
});

// Global variable to store exercises
let exerciseDatabase = [];

// Exercise blacklist functions
function getBlacklistedExercises() {
    return JSON.parse(localStorage.getItem('blacklisted-exercises') || '[]');
}

function saveBlacklistedExercises(blacklist) {
    localStorage.setItem('blacklisted-exercises', JSON.stringify(blacklist));
}

function blacklistExercise(exerciseName) {
    const blacklist = getBlacklistedExercises();
    if (!blacklist.includes(exerciseName)) {
        blacklist.push(exerciseName);
        saveBlacklistedExercises(blacklist);
        console.log(`Added ${exerciseName} to blacklist`);
        return true;
    }
    return false;
}

function removeFromBlacklist(exerciseName) {
    const blacklist = getBlacklistedExercises();
    const updated = blacklist.filter(name => name !== exerciseName);
    saveBlacklistedExercises(updated);
    console.log(`Removed ${exerciseName} from blacklist`);
}

// Load exercise data from backend
async function loadExerciseDatabase() {
    try {
        const response = await fetch('/api/exercises');
        if (!response.ok) {
            throw new Error('Failed to load exercises');
        }
        exerciseDatabase = await response.json();
        console.log('Loaded exercises:', exerciseDatabase.length);
    } catch (error) {
        console.error('Failed to load exercises:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    const durationSlider = document.getElementById('workout-duration');
    const durationValue = document.getElementById('duration-value');
    
    // Fix the slider event - use 'input' event for real-time updates
    if (durationSlider && durationValue) {
        // Set initial value
        durationValue.textContent = `${durationSlider.value} minutes`;
        
        // Set initial color
        updateSliderColor(durationSlider);
        
        // Update value and color as slider moves
        durationSlider.addEventListener('input', () => {
            durationValue.textContent = `${durationSlider.value} minutes`;
            updateSliderColor(durationSlider);
        });
    }

    // Add event listeners for the "Full Body" checkbox
    const fullBodyCheckbox = document.getElementById('full-body-checkbox');
    const bodyPartCheckboxes = document.querySelectorAll('.body-part-checkbox');
    
    if (fullBodyCheckbox) {
        fullBodyCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck and disable other body part checkboxes
                bodyPartCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
        
        // When any other body part checkbox is checked, uncheck Full Body
        bodyPartCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked && fullBodyCheckbox.checked) {
                    fullBodyCheckbox.checked = false;
                }
            });
        });
    }
    
    // Add event listeners for the "All" equipment checkbox
    const allEquipmentCheckbox = document.getElementById('all-equipment-checkbox');
    const equipmentCheckboxes = document.querySelectorAll('.equipment-checkbox');
    
    if (allEquipmentCheckbox) {
        allEquipmentCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck other equipment checkboxes
                equipmentCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
        
        // When any other equipment checkbox is checked, uncheck All
        equipmentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked && allEquipmentCheckbox.checked) {
                    allEquipmentCheckbox.checked = false;
                }
            });
        });
    }

    document.getElementById('workout-form').addEventListener('submit', handleFormSubmit);
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            document.getElementById('exercise-modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('exercise-modal')) {
            document.getElementById('exercise-modal').style.display = 'none';
        }
    });
    
    // Theme toggle
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        const themeSwitch = document.getElementById('theme-switch');
        if (themeSwitch) {
            themeSwitch.checked = true;
        }
        
        // Update slider color for dark mode
        const durationSlider = document.getElementById('workout-duration');
        if (durationSlider) {
            updateSliderColor(durationSlider);
        }
    }
    
    // Add theme switch event listener
    const themeSwitch = document.getElementById('theme-switch');
    if (themeSwitch) {
        themeSwitch.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
            
            // Update slider color when theme changes
            const durationSlider = document.getElementById('workout-duration');
            if (durationSlider) {
                updateSliderColor(durationSlider);
            }
        });
    }
    
    // Initialize saved workouts button
    initializeSavedWorkoutsButton();
}

// Initialize the saved workouts button
function initializeSavedWorkoutsButton() {
    const savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
    if (savedWorkouts.length > 0) {
        // Only add the button if it doesn't already exist
        if (!document.getElementById('view-saved-workouts-btn')) {
            createSavedWorkoutsSection();
        }
    }
}

// Create the saved workouts section
function createSavedWorkoutsSection() {
    const button = document.createElement('button');
    button.id = 'view-saved-workouts-btn';
    button.textContent = 'View Saved Workouts';
    button.classList.add('view-saved-btn');
    button.addEventListener('click', toggleSavedWorkouts);
    
    const container = document.createElement('div');
    container.className = 'saved-workouts-container';
    container.appendChild(button);
    
    // Create div for workouts
    const workoutsDiv = document.createElement('div');
    workoutsDiv.id = 'saved-workouts-list';
    workoutsDiv.style.display = 'none';
    container.appendChild(workoutsDiv);
    
    // Insert after the main element
    const main = document.querySelector('main');
    main.appendChild(container);
}

// Handle form submission to generate workout
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const formData = new FormData(e.target);
    const workoutParams = {
        focus: formData.getAll('workout-focus'),
        goal: formData.get('fitness-goal'),
        equipment: formData.getAll('equipment'),
        duration: formData.get('workout-duration'),
        style: formData.get('workout-style') || 'variety',
        blacklist: getBlacklistedExercises() // Include blacklist in request
    };
    
    // Save preferences
    savePreferences(workoutParams);

    try {
        // First try the main API
        let response = await fetch('/api/generate-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workoutParams)
        });

        // If it fails, try the fallback API
        if (!response.ok) {
            console.warn('Main API failed, trying fallback');
            response = await fetch('/api/generate-workout-fallback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workoutParams)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate workout');
            }
        }

        const workout = await response.json();
        displayWorkout(workout);
        
        // Scroll to workout section
        document.getElementById('workout-result').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Could not generate workout. Please try again.');
    }
}

// Validate the form inputs
function validateForm() {
    const focusInputs = document.querySelectorAll('input[name="workout-focus"]:checked');
    const equipmentInputs = document.querySelectorAll('input[name="equipment"]:checked');
    
    if (focusInputs.length === 0) {
        alert('Please select at least one body part to focus on.');
        return false;
    }
    
    if (equipmentInputs.length === 0) {
        alert('Please select at least one equipment type.');
        return false;
    }
    
    return true;
}

/**
 * Find a replacement exercise that matches the criteria of the hidden exercise
 */
async function findReplacementExercise(hiddenExercise, currentWorkout) {
  try {
    const blacklist = getBlacklistedExercises();
    
    // Create search criteria based on the hidden exercise
    const searchCriteria = {
      muscleGroup: hiddenExercise.muscleGroup,
      goal: currentWorkout.goal,
      equipment: currentWorkout.equipment,
      isCompound: hiddenExercise.isCompound, // Try to match compound/isolation type
      excludeNames: [
        ...blacklist,
        hiddenExercise.name,
        ...currentWorkout.exercises.map(ex => ex.name) // Exclude current workout exercises
      ]
    };
    
    console.log('Searching for replacement with criteria:', searchCriteria);
    
    // Call API to find replacement
    const response = await fetch('/api/find-replacement-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchCriteria)
    });
    
    if (!response.ok) {
      throw new Error('Failed to find replacement exercise');
    }
    
    const replacementExercise = await response.json();
    
    if (replacementExercise) {
      // Apply the same sets/reps as the original exercise
      replacementExercise.sets = hiddenExercise.sets;
      replacementExercise.reps = hiddenExercise.reps;
      
      // Ensure tips exist
      if (!replacementExercise.tips || replacementExercise.tips.length === 0) {
        replacementExercise.tips = [
          "Keep proper form throughout the exercise",
          "Breathe steadily during the movement",
          "Focus on controlled movements"
        ];
      }
    }
    
    return replacementExercise;
    
  } catch (error) {
    console.error('Error finding replacement exercise:', error);
    return null;
  }
}

/**
 * Enhanced hide exercise function with instant replacement
 */
async function hideExerciseWithReplacement(exerciseName, exerciseIndex) {
  const currentWorkout = window.currentWorkout;
  
  if (!currentWorkout || !currentWorkout.exercises[exerciseIndex]) {
    console.error('Current workout or exercise not found');
    return;
  }
  
  const exerciseToHide = currentWorkout.exercises[exerciseIndex];
  
  // Show loading state
  const exerciseCard = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
  const hideButton = exerciseCard.querySelector('.blacklist-exercise-btn');
  
  if (hideButton) {
    hideButton.textContent = 'Finding replacement...';
    hideButton.disabled = true;
  }
  
  // Add overlay to show loading
  exerciseCard.style.position = 'relative';
  const loadingOverlay = document.createElement('div');
  loadingOverlay.className = 'loading-overlay';
  loadingOverlay.innerHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      z-index: 10;
    ">
      <div style="text-align: center; color: #4a5568;">
        <div style="margin-bottom: 8px;">🔄</div>
        <div style="font-size: 14px;">Finding replacement...</div>
      </div>
    </div>
  `;
  exerciseCard.appendChild(loadingOverlay);
  
  try {
    // 1. Add to blacklist
    if (blacklistExercise(exerciseName)) {
      console.log(`Added ${exerciseName} to blacklist`);
    }
    
    // 2. Find replacement
    const replacementExercise = await findReplacementExercise(exerciseToHide, currentWorkout);
    
    if (replacementExercise) {
      // 3. Update the workout data
      currentWorkout.exercises[exerciseIndex] = replacementExercise;
      
      // 4. Update the UI with the new exercise
      updateExerciseCard(exerciseIndex, replacementExercise);
      
      // 5. Update localStorage
      localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout));
      
      // 6. Show success message
      showNotification(`Replaced "${exerciseName}" with "${replacementExercise.name}"`, 'success');
      
    } else {
      // No replacement found - remove the exercise entirely
      currentWorkout.exercises.splice(exerciseIndex, 1);
      
      // Remove the exercise card from UI
      exerciseCard.remove();
      
      // Update exercise numbering
      updateExerciseNumbering();
      
      // Update localStorage
      localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout));
      
      showNotification(`Removed "${exerciseName}" - no suitable replacement found`, 'warning');
    }
    
  } catch (error) {
    console.error('Error replacing exercise:', error);
    
    // Reset button state on error
    if (hideButton) {
      hideButton.textContent = 'Hide';
      hideButton.disabled = false;
    }
    
    showNotification('Failed to replace exercise. Try regenerating the workout.', 'error');
  } finally {
    // Remove loading overlay
    if (loadingOverlay && loadingOverlay.parentNode) {
      loadingOverlay.parentNode.removeChild(loadingOverlay);
    }
  }
}

/**
 * Update an exercise card with new exercise data
 */
function updateExerciseCard(exerciseIndex, newExercise) {
  const exerciseCard = document.querySelector(`[data-exercise-index="${exerciseIndex}"]`);
  
  if (!exerciseCard) {
    console.error(`Exercise card not found for index ${exerciseIndex}`);
    return;
  }
  
  // Determine the correct rep/time display format
  let repsDisplay;
  const currentWorkout = window.currentWorkout;
  
  if (currentWorkout.goal === 'cardio' || newExercise.reps.includes('seconds')) {
    repsDisplay = newExercise.reps;
  } else {
    repsDisplay = `${newExercise.reps} reps`;
    if (newExercise.isUnilateral) {
      repsDisplay += ' per side';
    }
  }
  
  // Check if the exercise has a video
  const hasVideo = newExercise.videoUrl ? 'has-video' : '';
  
  // Update the card content with animation
  exerciseCard.style.transition = 'transform 0.3s ease';
  exerciseCard.style.transform = 'scale(0.95)';
  
  setTimeout(() => {
    exerciseCard.innerHTML = `
      <h4>${exerciseIndex + 1}. ${newExercise.name}</h4>
      <img src="${newExercise.imageUrl || '/api/placeholder/150/150'}" alt="${newExercise.name}">
      <p>${newExercise.sets} sets × ${repsDisplay}</p>
      <div class="exercise-actions">
          <button class="view-exercise-btn" data-index="${exerciseIndex}">Details</button>
          <button class="blacklist-exercise-btn" data-exercise="${newExercise.name}">Hide</button>
      </div>
    `;
    
    // Update class for video indicator
    exerciseCard.className = `exercise-card ${hasVideo}`;
    
    // Re-add event listeners
    const detailsBtn = exerciseCard.querySelector('.view-exercise-btn');
    const hideBtn = exerciseCard.querySelector('.blacklist-exercise-btn');
    
    detailsBtn.addEventListener('click', () => {
      showExerciseDetails(exerciseIndex);
    });
    
    hideBtn.addEventListener('click', () => {
      if (confirm(`Hide "${newExercise.name}"? This will find a replacement exercise.`)) {
        hideExerciseWithReplacement(newExercise.name, exerciseIndex);
      }
    });
    
    // Animate back to normal
    exerciseCard.style.transform = 'scale(1)';
    
    // Add a subtle highlight to show the change
    exerciseCard.style.background = '#e6fffa';
    setTimeout(() => {
      exerciseCard.style.background = '';
    }, 2000);
    
  }, 150);
}

/**
 * Update exercise numbering after removal
 */
function updateExerciseNumbering() {
  const exerciseCards = document.querySelectorAll('.exercise-card');
  exerciseCards.forEach((card, index) => {
    const heading = card.querySelector('h4');
    if (heading) {
      const exerciseName = heading.textContent.replace(/^\d+\.\s*/, '');
      heading.textContent = `${index + 1}. ${exerciseName}`;
    }
    
    // Update data attributes
    card.setAttribute('data-exercise-index', index);
    
    // Update button data attributes
    const detailsBtn = card.querySelector('.view-exercise-btn');
    if (detailsBtn) {
      detailsBtn.setAttribute('data-index', index);
    }
  });
}

/**
 * Show notification to user
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  // Set background color based on type
  const colors = {
    success: '#48bb78',
    warning: '#ed8936',
    error: '#f56565',
    info: '#4299e1'
  };
  notification.style.backgroundColor = colors[type] || colors.info;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Updated displayWorkout function with instant replacement functionality
function displayWorkout(workout) {
  const workoutResult = document.getElementById('workout-result');
  workoutResult.innerHTML = ''; // Clear previous results
  workoutResult.style.display = 'block';

  // Format focus areas to be user-friendly
  let formattedFocus;
  if (Array.isArray(workout.focus)) {
    // Convert focus areas from snake_case to Title Case
    const formattedFocusArray = workout.focus.map(focus => {
      // Handle full_body special case
      if (focus === 'full_body') return 'Full Body';
      
      // Convert other snake_case to Title Case
      return focus.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    });
    
    formattedFocus = formattedFocusArray.join(', ');
  } else {
    // Handle single focus as string
    formattedFocus = workout.focus === 'full_body' ? 'Full Body' : 
      workout.focus.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
  }
  
  // Format the goal properly from snake_case to Title Case
  let formattedGoal;
  if (workout.goal === 'general_fitness') {
    formattedGoal = 'General Fitness';
  } else {
    formattedGoal = workout.goal.charAt(0).toUpperCase() + workout.goal.slice(1);
  }

  const summaryHTML = `
      <h3>${workout.name}</h3>
      <div class="workout-summary">
          <p><strong>Focus:</strong> ${formattedFocus}</p>
          <p><strong>Goal:</strong> ${formattedGoal}</p>
          <p><strong>Duration:</strong> ${workout.duration} minutes</p>
          <p><strong>Style:</strong> ${workout.style === 'focus' ? 'Focus (High Volume)' : 'Variety'}</p>
          <p><strong>Exercises:</strong> ${workout.exercises.length}</p>
      </div>
      <div class="workout-actions">
          <button id="regenerate-btn">Regenerate Workout</button>
          <button id="save-workout-btn">Save Workout</button>
          <button id="manage-blacklist-btn">Manage Hidden Exercises</button>
      </div>
  `;
  workoutResult.insertAdjacentHTML('beforeend', summaryHTML);
  
  // Add recommended warm-up and cool-down
  const warmupHTML = `
    <div class="workout-section">
      <h4>Recommended Warm-up (5 min)</h4>
      <p>Start with 2-3 minutes of light cardio (jogging in place, jumping jacks) followed by dynamic stretches for the muscle groups you'll be working.</p>
    </div>
  `;
  workoutResult.insertAdjacentHTML('beforeend', warmupHTML);
  
  // Add event listeners to buttons
  document.getElementById('regenerate-btn').addEventListener('click', regenerateWorkout);
  document.getElementById('save-workout-btn').addEventListener('click', () => saveWorkout(workout));
  document.getElementById('manage-blacklist-btn').addEventListener('click', showBlacklistManager);

  // Create container for exercises
  const exercisesContainer = document.createElement('div');
  exercisesContainer.className = 'exercises-container';
  
  // Add a header before the exercises
  const exercisesHeader = document.createElement('h4');
  exercisesHeader.textContent = 'Main Workout';
  exercisesHeader.style.marginTop = '20px';
  exercisesHeader.style.marginBottom = '15px';
  workoutResult.appendChild(exercisesHeader);
  
  workout.exercises.forEach((exercise, index) => {
    // Determine the correct rep/time display format
    let repsDisplay;
    
    if (workout.goal === 'cardio' || exercise.reps.includes('seconds')) {
        // For cardio workouts or exercises with seconds, show time
        repsDisplay = exercise.reps;
    } else {
        // For strength/regular workouts, show reps
        repsDisplay = `${exercise.reps} reps`;
        
        // Add "per side" for unilateral exercises
        if (exercise.isUnilateral) {
          repsDisplay += ' per side';
        }
    }
    
    // Check if the exercise has a video
    const hasVideo = exercise.videoUrl ? 'has-video' : '';
    
    const exerciseHTML = `
        <div class="exercise-card ${hasVideo}" data-exercise-index="${index}">
            <h4>${index + 1}. ${exercise.name}</h4>
            <img src="${exercise.imageUrl || '/api/placeholder/150/150'}" alt="${exercise.name}">
            <p>${exercise.sets} sets × ${repsDisplay}</p>
            <div class="exercise-actions">
                <button class="view-exercise-btn" data-index="${index}">Details</button>
                <button class="blacklist-exercise-btn" data-exercise="${exercise.name}">Hide</button>
            </div>
        </div>
    `;
    exercisesContainer.insertAdjacentHTML('beforeend', exerciseHTML);
  });
  
  workoutResult.appendChild(exercisesContainer);
  
  // Add cool-down suggestion
  const cooldownHTML = `
    <div class="workout-section" style="margin-top: 20px;">
      <h4>Recommended Cool-down (5 min)</h4>
      <p>Finish with 5 minutes of static stretching, focusing on the muscles you worked. Hold each stretch for 20-30 seconds.</p>
    </div>
  `;
  workoutResult.insertAdjacentHTML('beforeend', cooldownHTML);

  // Save the workout globally so we can access it in showExerciseDetails
  window.currentWorkout = workout;
  
  // Store the current workout in localStorage for the image generator
  localStorage.setItem('currentWorkout', JSON.stringify(workout));
  
  // Add event listeners to exercise detail buttons
  document.querySelectorAll('.view-exercise-btn').forEach(button => {
    button.addEventListener('click', () => {
        const index = parseInt(button.dataset.index);
        showExerciseDetails(index);
    });
  });
  
  // Add event listeners to blacklist buttons with instant replacement
  document.querySelectorAll('.blacklist-exercise-btn').forEach(button => {
    button.addEventListener('click', () => {
        const exerciseName = button.dataset.exercise;
        const exerciseIndex = parseInt(button.closest('.exercise-card').dataset.exerciseIndex);
        
        if (confirm(`Hide "${exerciseName}"? This will find a replacement exercise.`)) {
            hideExerciseWithReplacement(exerciseName, exerciseIndex);
        }
    });
  });
}

// Show blacklist manager modal
function showBlacklistManager() {
  const blacklist = getBlacklistedExercises();
  
  // Create modal HTML with correct structure and styling
  const modalHTML = `
    <div id="blacklist-modal" style="display: flex; position: fixed; z-index: 999; left: 0; top: 0; width: 100vw; height: 100vh; overflow: auto; background-color: rgba(0, 0, 0, 0.6); justify-content: center; align-items: center;">
      <div class="modal-content">
        <span class="close-modal" onclick="document.getElementById('blacklist-modal').remove()">&times;</span>
        <h2>Manage Hidden Exercises</h2>
        <p>These exercises won't appear in future workouts:</p>
        <div id="blacklist-list">
          ${blacklist.length === 0 ? 
            '<p style="color: #666; font-style: italic;">No exercises hidden yet.</p>' : 
            blacklist.map(exercise => `
              <div class="blacklist-item">
                <span>${exercise}</span>
                <button class="remove-blacklist-btn" data-exercise="${exercise}">Remove</button>
              </div>
            `).join('')
          }
        </div>
        <button onclick="document.getElementById('blacklist-modal').remove()" style="margin-top: 20px; background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Close</button>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Add event listeners to remove buttons
  document.querySelectorAll('.remove-blacklist-btn').forEach(button => {
    button.addEventListener('click', () => {
      const exerciseName = button.dataset.exercise;
      if (confirm(`Remove "${exerciseName}" from hidden list?`)) {
        removeFromBlacklist(exerciseName);
        // Refresh the modal
        document.getElementById('blacklist-modal').remove();
        showBlacklistManager();
      }
    });
  });
}

// Regenerate workout using same parameters
async function regenerateWorkout() {
    // Get saved preferences from localStorage
    const savedPrefs = localStorage.getItem('workout-preferences');
    if (!savedPrefs) {
        alert('No preferences found. Please fill the form again.');
        return;
    }
    
    const workoutParams = JSON.parse(savedPrefs);
    // Make sure to include current blacklist
    workoutParams.blacklist = getBlacklistedExercises();
    
    try {
        const response = await fetch('/api/generate-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workoutParams)
        });

        if (!response.ok) {
            throw new Error('Failed to regenerate workout');
        }

        const workout = await response.json();
        displayWorkout(workout);
    } catch (error) {
        console.error('Error:', error);
        alert('Could not regenerate workout. Please try again.');
    }
}

// Save the current workout locally
function saveWorkout(workout) {
    try {
        // Get any previously saved workouts
        let savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
        
        // Add a timestamp to the workout
        const workoutToSave = {
            ...workout,
            savedAt: new Date().toISOString()
        };
        
        // Add to the beginning of the array
        savedWorkouts.unshift(workoutToSave);
        
        // Limit to 10 saved workouts to prevent localStorage from getting too full
        if (savedWorkouts.length > 10) {
            savedWorkouts = savedWorkouts.slice(0, 10);
        }
        
        // Save back to localStorage
        localStorage.setItem('saved-workouts', JSON.stringify(savedWorkouts));
        
        // Create or update the saved workouts button if it doesn't exist
        if (!document.getElementById('view-saved-workouts-btn')) {
            createSavedWorkoutsSection();
        }
        
        // Update navigation indicator
        updateSavedWorkoutsNavIndicator();
        
        alert('Workout saved! You can view your saved workouts using the navigation or button below.');
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('An error occurred while saving the workout');
    }
}

// Update saved workouts navigation indicator
function updateSavedWorkoutsNavIndicator() {
    const savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
    const savedWorkoutsNav = document.getElementById('saved-workouts-nav');
    
    if (savedWorkoutsNav) {
        if (savedWorkouts.length > 0) {
            savedWorkoutsNav.classList.add('has-saved-workouts');
        } else {
            savedWorkoutsNav.classList.remove('has-saved-workouts');
        }
    }
}

// Show more info in a modal
function showExerciseDetails(index) {
    const exercise = window.currentWorkout.exercises[index];
    document.getElementById('modal-exercise-name').textContent = exercise.name;
    document.getElementById('modal-exercise-image').src = exercise.imageUrl || '/api/placeholder/400/300';
    document.getElementById('modal-exercise-instructions').textContent = exercise.instructions || 'No instructions available.';

    const tipsList = document.getElementById('modal-exercise-tips');
    tipsList.innerHTML = '';
    if (exercise.tips?.length) {
        exercise.tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    } else {
        tipsList.innerHTML = '<li>No tips available.</li>';
    }

    document.getElementById('exercise-modal').style.display = 'block';
}

// Save user preferences locally
function savePreferences(preferences) {
    localStorage.setItem('workout-preferences', JSON.stringify(preferences));
    console.log('Preferences saved locally');
}

// Load saved preferences (from localStorage)
function loadPreferences() {
    const saved = localStorage.getItem('workout-preferences');
    if (!saved) return;
    
    try {
        const prefs = JSON.parse(saved);

        document.querySelectorAll('input[name="workout-focus"]').forEach(cb => {
            cb.checked = prefs.focus?.includes(cb.value);
        });
        document.querySelectorAll('input[name="equipment"]').forEach(cb => {
            cb.checked = prefs.equipment?.includes(cb.value);
        });
        
        const goalSelect = document.getElementById('fitnessGoal');
        if (goalSelect) {
            goalSelect.value = prefs.goal || 'strength';
        }
        
        const durationSlider = document.getElementById('workout-duration');
        if (durationSlider) {
            durationSlider.value = prefs.duration || 30;
            document.getElementById('duration-value').textContent = `${prefs.duration || 30} minutes`;
            // Update slider color based on saved value
            updateSliderColor(durationSlider);
        }
        
        const workoutStyle = document.getElementById('workout-style');
        if (workoutStyle && prefs.style) {
            workoutStyle.value = prefs.style;
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

/**
 * Updates the slider color based on its current value
 * @param {HTMLInputElement} slider - The range slider element
 */
function updateSliderColor(slider) {
    if (!slider) return;
    
    // Calculate percentage
    const min = parseInt(slider.min) || 0;
    const max = parseInt(slider.max) || 100;
    const value = parseInt(slider.value) || 0;
    const percentage = ((value - min) / (max - min)) * 100;
    
    // Apply color gradient based on percentage
    slider.style.setProperty('--slider-progress', `${percentage}%`);
    
    // For Firefox - create a linear gradient background
    // This is needed because Firefox doesn't support ::before on range inputs
    const backgroundGradient = `linear-gradient(to right, 
        var(--primary-color) 0%, 
        var(--primary-color) ${percentage}%, 
        #ddd ${percentage}%, 
        #ddd 100%)`;
        
    slider.style.background = backgroundGradient;
    
    // Special handling for dark mode
    if (document.body.classList.contains('dark-mode')) {
        const darkModeGradient = `linear-gradient(to right, 
            var(--primary-color-dark) 0%, 
            var(--primary-color-dark) ${percentage}%, 
            #444 ${percentage}%, 
            #444 100%)`;
        slider.style.background = darkModeGradient;
    }
}

// Toggle the display of saved workouts
function toggleSavedWorkouts() {
    const savedWorkoutsList = document.getElementById('saved-workouts-list');
    const viewSavedBtn = document.getElementById('view-saved-workouts-btn');
    
    if (savedWorkoutsList.style.display === 'none') {
        // Show saved workouts
        loadSavedWorkouts();
        savedWorkoutsList.style.display = 'block';
        viewSavedBtn.textContent = 'Hide Saved Workouts';
    } else {
        // Hide saved workouts
        savedWorkoutsList.style.display = 'none';
        viewSavedBtn.textContent = 'View Saved Workouts';
    }
}

// Load and display saved workouts
function loadSavedWorkouts() {
    const savedWorkoutsList = document.getElementById('saved-workouts-list');
    const savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
    
    if (savedWorkouts.length === 0) {
        savedWorkoutsList.innerHTML = '<p>No saved workouts found.</p>';
        return;
    }
    
    savedWorkoutsList.innerHTML = ''; // Clear the list
    
    // Create the workouts list
    savedWorkouts.forEach((workout, index) => {
        const workoutCard = document.createElement('div');
        workoutCard.className = 'saved-workout-card';
        
        // Format the date
        const savedDate = new Date(workout.savedAt).toLocaleDateString();
        
        // Format focus properly
        let formattedFocus = '';
        if (Array.isArray(workout.focus)) {
            formattedFocus = workout.focus.map(f => {
                if (f === 'full_body') return 'Full Body';
                return f.charAt(0).toUpperCase() + f.slice(1);
            }).join(', ');
        } else {
            formattedFocus = workout.focus === 'full_body' ? 'Full Body' : 
                workout.focus.charAt(0).toUpperCase() + workout.focus.slice(1);
        }
        
        // Format goal properly
        let formattedGoal = workout.goal;
        if (workout.goal === 'general_fitness') {
            formattedGoal = 'General Fitness';
        } else {
            formattedGoal = workout.goal.charAt(0).toUpperCase() + workout.goal.slice(1);
        }
        
        workoutCard.innerHTML = `
            <h3>${workout.name}</h3>
            <p><strong>Focus:</strong> ${formattedFocus}</p>
            <p><strong>Goal:</strong> ${formattedGoal}</p>
            <p><strong>Duration:</strong> ${workout.duration} minutes</p>
            <p><strong>Exercises:</strong> ${workout.exercises.length}</p>
            <p><strong>Saved:</strong> ${savedDate}</p>
            <div class="saved-workout-actions">
                <button class="load-saved-workout-btn" data-index="${index}">Load Workout</button>
                <button class="delete-saved-workout-btn" data-index="${index}">Delete</button>
            </div>
        `;
        
        savedWorkoutsList.appendChild(workoutCard);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.load-saved-workout-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            loadSavedWorkout(index);
        });
    });
    
    document.querySelectorAll('.delete-saved-workout-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteSavedWorkout(index);
        });
    });
}

// Load a specific saved workout and display it
function loadSavedWorkout(index) {
    const savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
    
    if (index >= 0 && index < savedWorkouts.length) {
        const workout = savedWorkouts[index];
        
        // Display the workout
        displayWorkout(workout);
        
        // Scroll to the workout result
        document.getElementById('workout-result').scrollIntoView({ behavior: 'smooth' });
        
        // Hide the saved workouts list
        document.getElementById('saved-workouts-list').style.display = 'none';
        document.getElementById('view-saved-workouts-btn').textContent = 'View Saved Workouts';
    } else {
        alert('Workout not found. It may have been deleted.');
        // Refresh the saved workouts list
        loadSavedWorkouts();
    }
}

// Delete a saved workout
function deleteSavedWorkout(index) {
    if (!confirm('Are you sure you want to delete this saved workout?')) {
        return;
    }
    
    let savedWorkouts = JSON.parse(localStorage.getItem('saved-workouts') || '[]');
    if (index >= 0 && index < savedWorkouts.length) {
        // Remove the workout at the specified index
        savedWorkouts.splice(index, 1);
        
        // Save back to localStorage
        localStorage.setItem('saved-workouts', JSON.stringify(savedWorkouts));
        
        // Update navigation indicator
        updateSavedWorkoutsNavIndicator();
        
        // Reload the list
        loadSavedWorkouts();
        
        // If no more saved workouts, hide the container
        if (savedWorkouts.length === 0) {
            document.getElementById('saved-workouts-list').style.display = 'none';
            document.getElementById('view-saved-workouts-btn').textContent = 'View Saved Workouts';
            
            // Remove the entire saved workouts container since there are no more workouts
            const container = document.querySelector('.saved-workouts-container');
            if (container) {
                container.remove();
            }
        }
        
        alert('Workout deleted successfully!');
    }
}