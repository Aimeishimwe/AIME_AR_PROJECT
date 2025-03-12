let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", function () {
  // Ensure inputs and buttons work after page loads
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document
    .getElementById("startVoiceBtn")
    .addEventListener("click", startVoiceCommand);

  greetUser();
  displayTasks();
});

// Greet the user when the app loads
function greetUser() {
  setTimeout(() => {
    speakResponse("Hello Aime, welcome back!");
  }, 1000);
}

// Add a task to the list
function addTask() {
  const taskNameInput = document.getElementById("taskName");
  const taskTimeInput = document.getElementById("taskTime");

  if (!taskNameInput || !taskTimeInput) {
    alert("Error: Input fields not found.");
    return;
  }

  const taskName = taskNameInput.value.trim();
  const taskTime = taskTimeInput.value.trim();

  if (!taskName || !taskTime) {
    alert("Please enter a task and time!");
    return;
  }

  const task = { name: taskName, time: new Date(taskTime).getTime() };
  tasks.push(task);
  saveTasks();
  displayTasks();
  setNotification(task);
  speakResponse(`Task ${taskName} added!`);

  // Clear input fields after adding a task
  taskNameInput.value = "";
  taskTimeInput.value = "";
}

// Display all tasks
function displayTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.innerHTML = `${task.name} - ${new Date(task.time).toLocaleString()}
                        <button onclick="deleteTask(${index})">❌</button>
                        <button onclick="updateTask(${index})">📝</button>`;
    taskList.appendChild(li);
  });
}

// Delete a task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
  speakResponse("Task deleted.");
}

// Update a task
function updateTask(index) {
  const newTaskName = prompt("Enter the new task name:");
  const newTaskTime = prompt("Enter the new deadline (yyyy-mm-ddTHH:MM:SS):");

  if (newTaskName && newTaskTime) {
    tasks[index] = { name: newTaskName, time: new Date(newTaskTime).getTime() };
    saveTasks();
    displayTasks();
    speakResponse(`Task updated to ${newTaskName}`);
  }
}

// Set a notification for the task
function setNotification(task) {
  const delay = task.time - new Date().getTime();
  if (delay > 0) {
    setTimeout(() => {
      speakResponse(`Reminder: ${task.name} is due now!`);
      alert(`Reminder: ${task.name} is due now!`);
    }, delay);
  }
}

// Voice recognition setup (Fixing for Mobile)
let recognition;
function startVoiceCommand() {
  if (!recognition) {
    recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = false; // Change to false for mobile support
    recognition.interimResults = false;
  }

  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    processVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event);
    speakResponse("I didn't catch that. Can you repeat?");
  };
}

// Process commands from voice input
function processVoiceCommand(command) {
  if (command.includes("add task")) {
    const taskName = command.replace("add task", "").trim();
    const taskTime = prompt(
      "Please provide the task deadline in format yyyy-mm-ddTHH:MM:SS:"
    );
    if (taskTime) {
      addVoiceTask(taskName, taskTime);
    }
  } else if (command.includes("next task")) {
    getNextTask();
  } else if (command.includes("delete task")) {
    deleteTaskByName(command);
  } else if (command.includes("update task")) {
    updateTaskByName(command);
  } else {
    speakResponse("I didn't understand. Please try again.");
  }
}

// Add a task via voice
function addVoiceTask(taskName, taskTime) {
  const task = { name: taskName, time: new Date(taskTime).getTime() };
  tasks.push(task);
  saveTasks();
  displayTasks();
  setNotification(task);
  speakResponse(
    `Task ${taskName} added with deadline at ${new Date(
      task.time
    ).toLocaleString()}`
  );
}

// Save tasks to local storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Text-to-speech function
function speakResponse(responseText) {
  const speech = new SpeechSynthesisUtterance(responseText);
  window.speechSynthesis.speak(speech);
}
