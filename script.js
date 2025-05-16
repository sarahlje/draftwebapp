// Global variables
let workoutData = null;
let exerciseDatabase = null;

// DOM Elements
const durationSlider = document.getElementById('workout-duration');
const durationValue = document.getElementById('duration-value');
const generateBtn = document.getElementById('generate-btn');
const savePreferencesBtn = document.getElementById('save-preferences');
const workoutForm = document.getElementById('workout-form');
const workoutResult = document.getElementById('workout-result');
const exerciseModal = document.getElementById('exercise-modal');
const closeModal = document.querySelector('.close-modal');

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Load exercise database
    try {
        const response = await fetch('/api/exercises');
        exerciseDatabase = await response.json();
        console.log('Exercise database loaded:', exerciseDatabase.length, 'exercises');
    } catch (error) {
        console.error('Error loading exercise database:', error);
    }

    // Load user preferences if available
    loadUserPreferences();
});

durationSlider.addEventListener('input', () => {
    durationValue.textContent = `${durationSlider.value} minutes`;
});

workoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await generateWorkout();
});

savePreferencesBtn.addEventListener('click', () => {
    saveUserPreferences();
});

closeModal.addEventListener('click', () => {
    exerciseModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === exerciseModal) {
        exerciseModal.style.display = 'none';
    }
});

// Functions
async function generateWorkout() {
    // Show loading state
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;

    try {
        // Get form data
        const formData = new FormData(workoutForm);
        const workoutParams = {
            focus: formData.get('workout-focus'),
            goal: formData.get('fitness-goal'),
            equipment: Array.from(formData.getAll('equipment')),
            duration: formData.get('workout-duration'),
            experienceLevel: formData.get('experience-level'),
            energyLevel: formData.get('energy-level')
        };

        // Call API to generate workout
        const response = await fetch('/api/generate-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workoutParams)
        });

        if (!response.ok) {
            throw new Error('Failed to generate workout');
        }

        workoutData = await response.json();
        
        // Render workout
        renderWorkout(workoutData);
        
        // Scroll to results
        workoutResult.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error generating workout:', error);
        alert('Sorry, there was an error generating your workout. Please try again.');
    } finally {
        // Reset button state
        generateBtn.textContent = 'Generate Workout';
        generateBtn.disabled = false;
    }
}

function renderWorkout(workout) {
    // Make result section visible
    workoutResult.classList.add('active');
    workoutResult.style.display = 'block';
    
    // Create workout content
    let html = `
        <div class="workout-header">
            <h3>${workout.name}</h3>
            <div class="workout-actions">
                <button class="save-workout"><i class="fas fa-save"></i> Save</button>
                <button class="refresh-workout"><i class="fas fa-sync-alt"></i> Refresh</button>
            </div>
        </div>
        <div class="workout-summary">
            <div class="summary-item">
                <i class="fas fa-dumbbell"></i>
                <span>Focus: ${capitalizeFirstLetter(workout.focus)}</span>
            </div>
            <div class="summary-item">
                <i class="fas fa-bullseye"></i>
                <span>Goal: ${capitalizeFirstLetter(workout.goal)}</span>
            </div>
            <div class="summary-item">
                <i class="fas fa-clock"></i>
                <span>Duration: ${workout.duration} minutes</span>
            </div>
            <div class="summary-item">
                <i class="fas fa-fire"></i>
                <span>Estimated Calories: ${workout.estimatedCalories}</span>
            </div>
        </div>
        <div class="workout-exercises">
    `;

    // Add exercise cards
    workout.exercises.forEach((exercise, index) => {
        html += createExerciseCard(exercise, index);
        
        // Add rest period if not the last exercise
        if (index < workout.exercises.length - 1) {
            html += `
                <div class="rest-period">
                    <i class="fas fa-hourglass-half"></i>
                    <span>Rest ${exercise.restPeriod} seconds</span>
                </div>
            `;
        }
    });

    html += `
        </div>
        <div class="workout-footer">
            <button class="workout-complete-btn">Complete Workout</button>
        </div>
    `;

    workoutResult.innerHTML = html;

    // Add event listeners to new elements
    document.querySelector('.refresh-workout').addEventListener('click', async () => {
        await generateWorkout();
    });

    document.querySelector('.save-workout').addEventListener('click', () => {
        saveWorkout(workout);
    });

    document.querySelector('.workout-complete-btn').addEventListener('click', () => {
        completeWorkout(workout);
    });

    // Add event listeners to view details buttons
    document.querySelectorAll('.view-details').forEach(button => {
        button.addEventListener('click', (e) => {
            const exerciseId = e.target.dataset.exerciseId;
            const exercise = workout.exercises.find(ex => ex.id === exerciseId);
            openExerciseModal(exercise);
        });
    });
}

function createExerciseCard(exercise, index) {
    return `
        <div class="exercise-card">
            <div class="exercise-header">
                <div class="exercise-title">
                    <div class="exercise-number">${index + 1}</div>
                    <div class="exercise-name">${exercise.name}</div>
                </div>
                <div class="exercise-details">
                    ${exercise.sets} sets × ${exercise.reps} ${exercise.goal === 'cardio' ? 'seconds' : 'reps'}
                </div>
            </div>
            <div class="exercise-body">
                <div class="exercise-image">
                    <img src="${exercise.imageUrl || '/api/placeholder/150/150'}" alt="${exercise.name}">
                </div>
                <div class="exercise-info">
                    <div class="exercise-stats">
                        <div class="stat-item">
                            <strong>Sets:</strong> ${exercise.sets}
                        </div>
                        <div class="stat-item">
                            <strong>Reps:</strong> ${exercise.reps}
                        </div>
                        <div class="stat-item">
                            <strong>Weight:</strong> ${exercise.suggestedWeight || 'Body weight'}
                        </div>
                    </div>
                    <div class="muscle-groups">
                        ${exercise.muscleGroups.map(muscle => `<span class="muscle-tag">${muscle}</span>`).join('')}
                    </div>
                    <div class="exercise-description">
                        ${exercise.shortDescription || 'No description available.'}
                    </div>
                    <a href="#" class="view-details" data-exercise-id="${exercise.id}">View full instructions</a>
                </div>
            </div>
        </div>
    `;
}

function openExerciseModal(exercise) {
    // Populate modal with exercise details
    document.getElementById('modal-exercise-name').textContent = exercise.name;
    document.getElementById('modal-exercise-image').src = exercise.imageUrl || '/api/placeholder/400/320';
    document.getElementById('modal-exercise-instructions').textContent = exercise.instructions || 'No detailed instructions available.';
    
    // Populate tips
    const tipsList = document.getElementById('modal-exercise-tips');
    tipsList.innerHTML = '';
    
    if (exercise.tips && exercise.tips.length > 0) {
        exercise.tips.forEach(tip => {
            const li = document.createElement('li');
            li.textContent = tip;
            tipsList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No specific tips available for this exercise.';
        tipsList.appendChild(li);
    }
    
    // Show modal
    exerciseModal.style.display = 'block';
}

function saveWorkout(workout) {
    try {
        // Send request to save workout to user's account
        fetch('/api/save-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workout)
        })
        .then(response => {
            if (response.ok) {
                alert('Workout saved successfully!');
            } else {
                throw new Error('Failed to save workout');
            }
        });
    } catch (error) {
        console.error('Error saving workout:', error);
        alert('Sorry, there was an error saving your workout. Please try again.');
    }
}

function completeWorkout(workout) {
    try {
        // Send request to mark workout as completed
        fetch('/api/complete-workout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                workoutId: workout.id,
                completedAt: new Date().toISOString()
            })
        })
        .then(response => {
            if (response.ok) {
                alert('Congratulations! Workout marked as completed.');
                // Redirect to dashboard or history page
                // window.location.href = '/history';
            } else {
                throw new Error('Failed to mark workout as completed');
            }
        });
    } catch (error) {
        console.error('Error completing workout:', error);
        alert('Sorry, there was an error recording your completion. Please try again.');
    }
}

function saveUserPreferences() {
    try {
        const formData = new FormData(workoutForm);
        const preferences = {
            focus: formData.get('workout-focus'),
            goal: formData.get('fitness-goal'),
            equipment: Array.from(formData.getAll('equipment')),
            duration: formData.get('workout-duration'),
            experienceLevel: formData.get('experience-level'),
            energyLevel: formData.get('energy-level')
        };
        
        // Save to localStorage (for anonymous users)
        localStorage.setItem('workout-preferences', JSON.stringify(preferences));
        
        // If user is logged in, save to database
        fetch('/api/save-preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        })
        .then(response => {
            if (response.ok) {
                alert('Preferences saved successfully!');
            }
        })
        .catch(error => {
            console.log('Preferences saved locally only:', error);
        });
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

function loadUserPreferences() {
    try {
        // Try to load from localStorage first
        const savedPrefs = localStorage.getItem('workout-preferences');
        if (savedPrefs) {
            const preferences = JSON.parse(savedPrefs);
            applyPreferences(preferences);
        }
        
        // If user is logged in, load from server
        fetch('/api/user-preferences')
            .then(response => response.json())
            .then(preferences => {
                if (preferences) {
                    applyPreferences(preferences);
                }
            })
            .catch(error => {
                console.log('Using local preferences only:', error);
            });
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

function applyPreferences(preferences) {
    // Apply focus
    document.querySelector(`input[name="workout-focus"][value="${preferences.focus}"]`).checked = true;
    
    // Apply goal
    document.querySelector(`input[name="fitness-goal"][value="${preferences.goal}"]`).checked = true;
    
    // Apply equipment
    document.querySelectorAll('input[name="equipment"]').forEach(checkbox => {
        checkbox.checked = preferences.equipment.includes(checkbox.value);
    });
    
    // Apply duration
    durationSlider.value = preferences.duration;
    durationValue.textContent = `${preferences.duration} minutes`;
    
    // Apply experience level
    document.querySelector('#experience-level').value = preferences.experienceLevel;
    
    // Apply energy level
    document.querySelector(`input[name="energy-level"][value="${preferences.energyLevel}"]`).checked = true;
}

// Helper functions
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}