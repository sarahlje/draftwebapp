const allExercises = [
  {
    name: "Push-Ups",
    muscleGroup: "upper body",
    intensityLevel: "medium",
    durationEstimate: 60,
    equipment: [],
    goalTags: ["strength", "endurance"],
    demoUrl: "https://example.com/pushup"
  },
  {
    name: "Dumbbell Shoulder Press",
    muscleGroup: "upper body",
    intensityLevel: "medium",
    durationEstimate: 90,
    equipment: ["dumbbells"],
    goalTags: ["strength", "hypertrophy"],
    demoUrl: "https://example.com/shoulderpress"
  },
  {
    name: "Bodyweight Squats",
    muscleGroup: "lower body",
    intensityLevel: "low",
    durationEstimate: 60,
    equipment: [],
    goalTags: ["cardio", "endurance"],
    demoUrl: "https://example.com/squats"
  }
  // Add more exercises here...
];

function generateWorkout({ goal, focusArea, equipment, timeLimit, energyLevel }) {
  const matching = allExercises.filter(ex => {
    return (
      ex.muscleGroup === focusArea &&
      ex.intensityLevel === energyLevel &&
      ex.goalTags.includes(goal) &&
      ex.equipment.every(eq => equipment.includes(eq))
    );
  });

  const shuffled = matching.sort(() => 0.5 - Math.random());
  const selected = [];
  let totalTime = 0;

  for (const ex of shuffled) {
    if (totalTime + ex.durationEstimate <= timeLimit) {
      selected.push(ex);
      totalTime += ex.durationEstimate;
    }
  }

  return selected;
}

function generate() {
  const goal = document.getElementById("goal").value;
  const focusArea = document.getElementById("focusArea").value;
  const energyLevel = document.getElementById("energyLevel").value;
  const timeLimit = parseInt(document.getElementById("timeLimit").value) * 60;
  const equipmentInput = document.getElementById("equipment").value;
  const equipment = equipmentInput.split(',').map(e => e.trim().toLowerCase());

  const workout = generateWorkout({ goal, focusArea, equipment, timeLimit, energyLevel });
  const resultDiv = document.getElementById("workoutResult");

  if (workout.length === 0) {
    resultDiv.innerHTML = "<p>No matching exercises found. Try adjusting your inputs.</p>";
    return;
  }

  resultDiv.innerHTML = workout.map(ex => `
    <div class="exercise">
      <strong>${ex.name}</strong><br />
      Duration: ${ex.durationEstimate}s<br />
      <a href="${ex.demoUrl}" target="_blank">View Demo</a>
    </div>
  `).join('');
}
