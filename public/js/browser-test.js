// browser-test.js - For direct browser inclusion

// Immediately invoke function to test the API endpoints directly
(async function() {
  console.log("Running API tests...");
  let resultsHtml = "";
  
  // Add result to page
  function addResult(title, message, isSuccess) {
    const color = isSuccess ? "green" : "red";
    const icon = isSuccess ? "✅" : "❌";
    resultsHtml += `<div style="margin-bottom: 10px;">
      <strong style="color: ${color}">${icon} ${title}:</strong> 
      <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto;">${message}</pre>
    </div>`;
  }

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
      const response = await fetch('/api/generate-workout', {
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
        addResult("Main API", JSON.stringify(data, null, 2).slice(0, 300) + "...", true);
        return true;
      } else {
        console.log("❌ Main API failed:");
        console.log(data);
        addResult("Main API", JSON.stringify(data, null, 2), false);
        return false;
      }
    } catch (error) {
      console.error("❌ Error testing main API:", error.message);
      addResult("Main API", error.message, false);
      return false;
    }
  }

  // Function to test the fallback API
  async function testFallbackApi() {
    console.log("\nTesting fallback workout generation API...");
    try {
      const response = await fetch('/api/generate-workout-fallback', {
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
        addResult("Fallback API", JSON.stringify(data, null, 2).slice(0, 300) + "...", true);
        return true;
      } else {
        console.log("❌ Fallback API failed:");
        console.log(data);
        addResult("Fallback API", JSON.stringify(data, null, 2), false);
        return false;
      }
    } catch (error) {
      console.error("❌ Error testing fallback API:", error.message);
      addResult("Fallback API", error.message, false);
      return false;
    }
  }

  // Function to check diagnostic endpoint
  async function checkDiagnostics() {
    console.log("\nChecking API diagnostics...");
    try {
      const response = await fetch('/api/diagnostics');
      const data = await response.json();
      console.log("Diagnostics results:");
      console.log(JSON.stringify(data, null, 2));
      addResult("Diagnostics", JSON.stringify(data, null, 2), true);
      return true;
    } catch (error) {
      console.error("❌ Error checking diagnostics:", error.message);
      addResult("Diagnostics", error.message, false);
      return false;
    }
  }

  // Run all tests
  let mainResult = await testMainApi();
  let fallbackResult = await testFallbackApi();
  let diagnosticsResult = await checkDiagnostics();
  
  // Create results element on page
  const resultsDiv = document.createElement('div');
  resultsDiv.innerHTML = `
    <div style="max-width: 800px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; font-family: Arial, sans-serif;">
      <h2>API Test Results</h2>
      ${resultsHtml}
      <h3>Summary</h3>
      <p>Main API: ${mainResult ? "Working" : "Not Working"}</p>
      <p>Fallback API: ${fallbackResult ? "Working" : "Not Working"}</p>
      <p>Diagnostics: ${diagnosticsResult ? "Working" : "Not Working"}</p>
      <p>Overall: ${(mainResult || fallbackResult) ? "Your app should be able to generate workouts" : "Both APIs are failing - check the server logs"}</p>
    </div>
  `;
  
  document.body.appendChild(resultsDiv);
})();