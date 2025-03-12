let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", function () {
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
  const taskName = document.getElementById("taskName").value;
  const taskTime = document.getElementById("taskTime").value;

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

// Voice recognition setup (continuous listening)
let recognition;
let voiceErrorCount = 0; // Track errors to stop after two attempts
function startVoiceCommand() {
  if (!recognition) {
    recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
  }

  recognition.start();

  recognition.onresult = (event) => {
    const command =
      event.results[event.results.length - 1][0].transcript.toLowerCase();
    processVoiceCommand(command);
  };

  recognition.onerror = (event) => {
    console.error("Voice recognition error:", event);

    // Stop after two failed attempts
    if (voiceErrorCount < 2) {
      speakResponse("I didn't catch that. Can you repeat?");
      voiceErrorCount++;
    } else {
      speakResponse("Voice command disabled. Try again later.");
      recognition.stop(); // Stop recognition
    }
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
    speakResponse("Aime Please try again.");
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

// Get the next scheduled task
function getNextTask() {
  if (tasks.length > 0) {
    tasks.sort((a, b) => a.time - b.time);
    const nextTask = tasks[0];
    speakResponse(
      `Your next task is: ${nextTask.name}, scheduled at ${new Date(
        nextTask.time
      ).toLocaleString()}`
    );
  } else {
    speakResponse("You have no tasks in your schedule.");
  }
}

// Delete a task by name
function deleteTaskByName(command) {
  const taskName = command.replace("delete task", "").trim();
  const taskIndex = tasks.findIndex(
    (task) => task.name.toLowerCase() === taskName.toLowerCase()
  );

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1);
    saveTasks();
    displayTasks();
    speakResponse(`Task ${taskName} deleted.`);
  } else {
    speakResponse("Task not found.");
  }
}

// Update a task by name
function updateTaskByName(command) {
  const taskName = command.replace("update task", "").trim();
  const taskIndex = tasks.findIndex(
    (task) => task.name.toLowerCase() === taskName.toLowerCase()
  );

  if (taskIndex !== -1) {
    const newTaskName = prompt("Enter the new task name:");
    const newTaskTime = prompt("Enter the new deadline (yyyy-mm-ddTHH:MM:SS):");

    if (newTaskName && newTaskTime) {
      tasks[taskIndex] = {
        name: newTaskName,
        time: new Date(newTaskTime).getTime(),
      };
      saveTasks();
      displayTasks();
      speakResponse(`Task updated to ${newTaskName}`);
    }
  } else {
    speakResponse("Task not found.");
  }
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
