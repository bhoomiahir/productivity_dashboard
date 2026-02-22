
//graph

let focusData = JSON.parse(localStorage.getItem("focusData")) || [0,0,0,0,0,0,0];
function getTodayIndex() {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

const ctx = document.getElementById('graphChart');

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri','Sat','Sun'],
    datasets: [{
      label: 'Focus Hours',
      data: focusData,
      tension: 0.4,          // smooth curve
      fill: true             // shaded area under line
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

function updateTodayDisplay() {
  const today = getTodayIndex();
  document.getElementById("todayHours").textContent =
    "Today: " + focusData[today].toFixed(1) + " hrs";
}

updateTodayDisplay();

// ===== Record Focus Time =====
function recordFocus(minutes) {
  const today = getTodayIndex();
  focusData[today] += minutes / 60;

  localStorage.setItem("focusData", JSON.stringify(focusData));

  chart.data.datasets[0].data = focusData;
  chart.update();
  updateTodayDisplay();
}


//toDolist
function createTask(text, container) {
  const card = document.createElement("div");
  card.className = "note-card";

  card.innerHTML = `
    <div class="note-left">
      <input type="checkbox">
      <span>${text}</span>
    </div>
  `;

  const checkbox = card.querySelector("input");
  const taskText = card.querySelector("span");

  checkbox.addEventListener("change", () => {
    card.classList.toggle("done");

    if (checkbox.checked) {
      addToCompleted(taskText.textContent);
    } else {
      removeFromCompleted(taskText.textContent);
    }
  });

  container.appendChild(card);
}

function addToCompleted(text) {
  const list = document.getElementById("completedList");

  // prevent duplicate entry
  if (list.querySelector(`[data-task="${text}"]`)) return;

  const item = document.createElement("li");
  item.textContent = text;
  item.setAttribute("data-task", text);
  list.appendChild(item);
}

function removeFromCompleted(text) {
  const list = document.getElementById("completedList");
  const items = list.querySelectorAll("li");

  items.forEach(item => {
    if (item.getAttribute("data-task") === text) {
      item.remove();
    }
  });
}
function setupInput(inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);

  if (!input || !container) return;

  input.addEventListener("keypress", function(e) {
    if (e.key === "Enter" && input.value.trim() !== "") {
      createTask(input.value, container);
      input.value = "";
    }
  });
}
// connect all three
setupInput("dailyInput", "dailyContainer");
setupInput("weeklyInput", "weeklyContainer");
setupInput("monthlyInput", "monthlyContainer");


//timer
// ===== TIMER SYSTEM =====

const focusInput = document.getElementById("focusInput");

let currentSessionMinutes = parseInt(focusInput.value) || 25;
let timeLeft = currentSessionMinutes * 60;
let timerInterval = null;


// show time on screen
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  document.getElementById("time").textContent =
    `${minutes}:${seconds.toString().padStart(2, "0")}`;
}


// 👉 When user changes input → timer display updates immediately
focusInput.addEventListener("input", () => {
  const mins = parseInt(focusInput.value);

  if (mins > 0) {
    currentSessionMinutes = mins;
    timeLeft = mins * 60;
    updateDisplay();
  }
});


// start timer
function startTimer() {
  if (timerInterval) return;

  const mins = parseInt(focusInput.value);

  if (!mins || mins <= 0) {
    alert("Enter valid focus time");
    return;
  }

  currentSessionMinutes = mins;

  // ensure timer uses input value
  timeLeft = currentSessionMinutes * 60;
  updateDisplay();

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;

      alert("Session complete!");
      recordFocus(currentSessionMinutes);
    }
  }, 1000);
}


// pause timer
function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}


// 👉 Reset ALWAYS shows input value
function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;

  const mins = parseInt(focusInput.value) || 25;
  currentSessionMinutes = mins;
  timeLeft = mins * 60;

  updateDisplay();
}


// initial display
updateDisplay();