let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

document.addEventListener("DOMContentLoaded", function () {
  greetUser(); // Say hello when the app loads
  displayTasks();
});

function greetUser() {
  setTimeout(() => {
    speakResponse("Hello Aime, welcome back!");
  }, 1000); // Adding delay to ensure voice synthesis initializes properly
}

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

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
  speakResponse("Task deleted.");
}

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

function setNotification(task) {
  const delay = task.time - new Date().getTime();
  if (delay > 0) {
    setTimeout(() => {
      speakResponse(`Reminder: ${task.name} is due now!`);
      alert(`Reminder: ${task.name} is due now!`);
    }, delay);
  }
}

// Voice recognition (NOT running automatically on page load)
function startVoiceCommand() {
  const recognition = new (window.SpeechRecognition ||
    window.webkitSpeechRecognition)();
  recognition.lang = "en-US";
  recognition.start();

  recognition.onresult = (event) => {
    const command = event.results[0][0].transcript.toLowerCase();
    processVoiceCommand(command);
  };
}

function processVoiceCommand(command) {
  if (command.includes("add task")) {
    const taskName = command.split("add task ")[1];
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
    speakResponse("Sorry, I couldn't understand your command.");
  }
}

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

function deleteTaskByName(command) {
  const taskName = command.split("delete task ")[1];
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

function updateTaskByName(command) {
  const taskName = command.split("update task ")[1];
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

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function speakResponse(responseText) {
  const speech = new SpeechSynthesisUtterance(responseText);
  window.speechSynthesis.speak(speech);
}
