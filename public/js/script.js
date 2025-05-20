// Load data and setup on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadExerciseDatabase();
    loadPreferences();
    setupEventListeners();
});

// Global variable to store exercises
let exerciseDatabase = [];

// Load exercise data from backend
async function loadExerciseDatabase() {
    try {
        const response = await fetch('/api/exercises');
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
    durationSlider.addEventListener('input', () => {
        durationValue.textContent = `${durationSlider.value} minutes`;
    });

    document.getElementById('workout-form').addEventListener('submit', handleFormSubmit);
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('exercise-modal').style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('exercise-modal')) {
            document.getElementById('exercise-modal').style.display = 'none';
        }
    });
}

// Handle form submission to generate workout
async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const workoutParams = {
        focus: formData.getAll('workout-focus'),
        goal: formData.get('fitness-goal'),
        equipment: formData.getAll('equipment'),
        duration: formData.get('workout-duration'),
        experience: formData.get('experience-level')
    };

    try {
        const response = await fetch('/api/generate-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workoutParams)
        });

        if (!response.ok) throw new Error('Failed to generate workout');

        const workout = await response.json();
        displayWorkout(workout);
    } catch (error) {
        console.error('Error:', error);
        alert('Could not generate workout. Please try again.');
    }
}

// Show the generated workout on the page
function displayWorkout(workout) {
    const workoutResult = document.getElementById('workout-result');
    workoutResult.innerHTML = ''; // Clear previous results
    workoutResult.style.display = 'block';

    const summaryHTML = `
        <h3>${workout.name}</h3>
        <p><strong>Focus:</strong> ${Array.isArray(workout.focus) ? workout.focus.join(', ') : workout.focus}</p>
        <p><strong>Goal:</strong> ${workout.goal}</p>
        <p><strong>Duration:</strong> ${workout.duration} minutes</p>
    `;
    workoutResult.insertAdjacentHTML('beforeend', summaryHTML);

    workout.exercises.forEach((exercise, index) => {
        const exerciseHTML = `
            <div class="exercise-card">
                <h4>${index + 1}. ${exercise.name}</h4>
                <img src="${exercise.imageUrl || '/api/placeholder/150/150'}" alt="${exercise.name}">
                <p>${exercise.sets} sets × ${exercise.reps} ${workout.goal === 'cardio' ? 'seconds' : 'reps'}</p>
                <button onclick="showExerciseDetails(${index})">Details</button>
            </div>
        `;
        workoutResult.insertAdjacentHTML('beforeend', exerciseHTML);
    });

    // Save the workout globally so we can access it in showExerciseDetails
    window.currentWorkout = workout;
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

// Save user preferences locally and (optionally) to server
function savePreferences() {
    const form = document.getElementById('workout-form');
    const formData = new FormData(form);
    const preferences = {
        focus: formData.getAll('workout-focus'),
        goal: formData.get('fitness-goal'),
        equipment: formData.getAll('equipment'),
        duration: formData.get('workout-duration'),
        experience: formData.get('experience-level')
    };
    localStorage.setItem('workout-preferences', JSON.stringify(preferences));

    // Optional: save to server if user is logged in
    fetch('/api/save-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
    }).catch(err => {
        console.log('Saved locally. Server save failed:', err);
    });

    alert('Preferences saved!');
}

// Load saved preferences (from localStorage or API)
function loadPreferences() {
    const saved = localStorage.getItem('workout-preferences');
    if (!saved) return;
    const prefs = JSON.parse(saved);

    document.querySelectorAll('input[name="workout-focus"]').forEach(cb => {
        cb.checked = prefs.focus?.includes(cb.value);
    });
    document.querySelectorAll('input[name="equipment"]').forEach(cb => {
        cb.checked = prefs.equipment?.includes(cb.value);
    });
    document.getElementById('fitnessGoal').value = prefs.goal || 'strength';
    document.getElementById('workout-duration').value = prefs.duration || 30;
    document.getElementById('duration-value').textContent = `${prefs.duration} minutes`;
    document.getElementById('experience-level').value = prefs.experience || 'beginner';
}
