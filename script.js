// Sana/vaqtni ko‘rsatish
const nowEl = document.getElementById('now');
function updateNow() {
  const d = new Date();
  nowEl.textContent = d.toLocaleString();
}
updateNow();
setInterval(updateNow, 1000);

// --- To-do list (vazifalar) ---
const newTask = document.getElementById('newTask');
const addTask = document.getElementById('addTask');
const todoList = document.getElementById('todoList');

let tasks = JSON.parse(localStorage.getItem('tasks_v1') || '[]');

function renderTasks() {
  todoList.innerHTML = '';
  const now = new Date();

  tasks.forEach((t, idx) => {
    const div = document.createElement('div');
    div.className = 'task' + (t.done ? ' completed' : '');

    const left = document.createElement('div');
    left.className = 'left';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.checked = t.done;
    chk.addEventListener('change', () => {
      t.done = chk.checked;
      saveTasks();
      renderTasks();
    });

    const span = document.createElement('div');
    span.textContent = t.text;

    // Deadline (vaqt) qo‘shilgan joy
    if (t.deadline) {
      const deadlineEl = document.createElement('small');
      const deadlineDate = new Date(t.deadline);
      deadlineEl.textContent = ' ⏰ ' + deadlineDate.toLocaleString();

      // Agar vaqt o‘tgan bo‘lsa qizil ko‘rsat
      if (deadlineDate < now && !t.done) {
        deadlineEl.style.color = 'tomato';
        deadlineEl.style.fontWeight = 'bold';
      } else {
        deadlineEl.style.color = '#9aa6b2';
      }

      span.appendChild(deadlineEl);
    }

    left.appendChild(chk);
    left.appendChild(span);

    const controls = document.createElement('div');
    controls.className = 'controls';

    const del = document.createElement('button');
    del.textContent = "O'chirish";
    del.className = 'small';
    del.addEventListener('click', () => {
      tasks.splice(idx, 1);
      saveTasks();
      renderTasks();
    });

    controls.appendChild(del);
    div.appendChild(left);
    div.appendChild(controls);
    todoList.appendChild(div);
  });
}

function saveTasks() {
  localStorage.setItem('tasks_v1', JSON.stringify(tasks));
}

addTask.addEventListener('click', () => {
  const v = newTask.value.trim();
  const deadline = prompt("Vazifa muddatini kiriting (YYYY-MM-DD hh:mm) yoki bo‘sh qoldiring:");
  if (!v) return alert('Vazifa yozing');
  tasks.push({ text: v, done: false, deadline: deadline || null });
  newTask.value = '';
  saveTasks();
  renderTasks();
});

document.getElementById('clearDone').addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
});

document.getElementById('clearAll').addEventListener('click', () => {
  if (confirm("Hammasini o‘chirmoqchimisiz?")) {
    tasks = [];
    saveTasks();
    renderTasks();
  }
});

renderTasks();

// --- Kalkulyator ---
const expr = document.getElementById('expr');
const calcBtn = document.getElementById('calcBtn');
const calcResult = document.getElementById('calcResult');

document.querySelectorAll('[data-val]').forEach(b =>
  b.addEventListener('click', () => { expr.value += b.dataset.val; })
);

document.getElementById('clearExpr').addEventListener('click', () => expr.value = '');

calcBtn.addEventListener('click', () => {
  const s = expr.value.trim();
  if (!s) { alert("Ifoda kiriting"); return; }
  try {
    if (!/^[0-9+\-*/(). %]+$/.test(s)) throw new Error("Noto‘g‘ri belgilar");
    const res = Function('return (' + s + ')')();
    calcResult.textContent = String(res);
  } catch (e) {
    alert("Hisoblashda xato: " + e.message);
  }
});

// --- Timer ---
const minutesInput = document.getElementById('minutes');
const startTimer = document.getElementById('startTimer');
const pauseTimer = document.getElementById('pauseTimer');
const resetTimer = document.getElementById('resetTimer');
const timeDisplay = document.getElementById('timeDisplay');

let timerId = null;
let remaining = 0;
let running = false;

function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return m + ':' + s;
}

function tick() {
  if (remaining > 0) {
    remaining--;
    timeDisplay.textContent = formatTime(remaining);
  } else {
    clearInterval(timerId);
    timerId = null;
    running = false;
    alert("Vaqt tugadi!");
  }
}

startTimer.addEventListener('click', () => {
  if (running) return;
  const mins = parseInt(minutesInput.value || 0, 10);
  if (isNaN(mins) || mins <= 0) {
    alert("Iltimos, minimal minut kiriting (1 yoki undan katta).");
    return;
  }
  remaining = mins * 60;
  timeDisplay.textContent = formatTime(remaining);
  timerId = setInterval(tick, 1000);
  running = true;
});

pauseTimer.addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    running = false;
  } else {
    if (remaining > 0) {
      timerId = setInterval(tick, 1000);
      running = true;
    }
  }
});

resetTimer.addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  remaining = 0;
  running = false;
  timeDisplay.textContent = '00:00';
});

// --- Eslatma (notes) ---
const noteText = document.getElementById('noteText');
const saveNote = document.getElementById('saveNote');
const loadNote = document.getElementById('loadNote');

saveNote.addEventListener('click', () => {
  localStorage.setItem('note_v1', noteText.value);
  alert("Eslatma saqlandi.");
});

loadNote.addEventListener('click', () => {
  noteText.value = localStorage.getItem('note_v1') || '';
  alert("Eslatma yuklandi.");
});

// Enter tugmasi bilan vazifa qo‘shish
newTask.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { addTask.click(); }
});
