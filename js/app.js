/* ─────────────────────────────────────────────────────────────────────
   Study Planner — app.js
   State lives in localStorage as an array of task objects:
   {
     id:          string   (crypto.randomUUID or Date.now fallback)
     subject:     string
     description: string
     dueDate:     string   (YYYY-MM-DD)
     done:        boolean
     createdAt:   number   (timestamp)
   }
──────────────────────────────────────────────────────────────────────── */

const STORAGE_KEY = 'studyPlanner_tasks';

// ── DOM refs ────────────────────────────────────────────────────────────
const form            = document.getElementById('task-form');
const inputSubject    = document.getElementById('subject');
const inputDate       = document.getElementById('due-date');
const inputDesc       = document.getElementById('description');
const filterSubject   = document.getElementById('filter-subject');
const filterStatus    = document.getElementById('filter-status');
const sortOrder       = document.getElementById('sort-order');
const taskList        = document.getElementById('task-list');
const taskCount       = document.getElementById('task-count');

// ── Helpers ─────────────────────────────────────────────────────────────
function genId() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(36).slice(2);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];   // YYYY-MM-DD local
}

/** Format YYYY-MM-DD → "Mon DD, YYYY" */
function formatDate(str) {
  if (!str) return '';
  // Parse as local date to avoid UTC-offset shifts
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

/** Returns 'overdue' | 'today' | 'upcoming' */
function dueDateStatus(str) {
  if (!str) return 'upcoming';
  const today = todayStr();
  if (str < today) return 'overdue';
  if (str === today) return 'today';
  return 'upcoming';
}

// ── Storage ─────────────────────────────────────────────────────────────
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// ── State ────────────────────────────────────────────────────────────────
let tasks = loadTasks();

// ── Mutations ────────────────────────────────────────────────────────────
function addTask(subject, description, dueDate) {
  const task = {
    id: genId(),
    subject: subject.trim(),
    description: description.trim(),
    dueDate,
    done: false,
    createdAt: Date.now()
  };
  tasks.unshift(task);
  saveTasks(tasks);
  return task;
}

function toggleDone(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks(tasks);
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(tasks);
}

// ── Filtering & sorting ──────────────────────────────────────────────────
function getFilteredTasks() {
  const subj   = filterSubject.value;
  const status = filterStatus.value;
  const order  = sortOrder.value;

  let result = tasks.slice();

  if (subj !== 'all') {
    result = result.filter(t => t.subject.toLowerCase() === subj.toLowerCase());
  }

  if (status === 'pending') result = result.filter(t => !t.done);
  if (status === 'done')    result = result.filter(t =>  t.done);

  result.sort((a, b) => {
    const diff = (a.dueDate || '').localeCompare(b.dueDate || '');
    return order === 'asc' ? diff : -diff;
  });

  return result;
}

// ── Subject filter dropdown ──────────────────────────────────────────────
function refreshSubjectFilter() {
  const current = filterSubject.value;
  const subjects = [...new Set(tasks.map(t => t.subject))].sort();

  // Keep only the "all" option then re-add subjects
  filterSubject.innerHTML = '<option value="all">All Subjects</option>';
  subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = s;
    filterSubject.appendChild(opt);
  });

  // Restore selection if still valid
  if (subjects.includes(current)) filterSubject.value = current;
}

// ── Render ───────────────────────────────────────────────────────────────
function render() {
  refreshSubjectFilter();

  const filtered = getFilteredTasks();

  // Task count badge
  const total   = tasks.length;
  const pending = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${filtered.length} shown · ${pending} pending · ${total} total`;

  // Clear list
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    taskList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">🗂️</span>
        <p class="empty-state__text">No tasks match the current filters.<br>Add a task or adjust the filters above.</p>
      </div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(task => {
    const dateStatus = dueDateStatus(task.dueDate);
    const isOverdue  = !task.done && dateStatus === 'overdue';
    const isToday    = !task.done && dateStatus === 'today';

    const card = document.createElement('div');
    card.className = [
      'task-card',
      task.done  ? 'task-card--done'    : '',
      isOverdue  ? 'task-card--overdue' : ''
    ].filter(Boolean).join(' ');
    card.dataset.id = task.id;

    // Badge label
    let badgeHtml = '';
    if (task.done)   badgeHtml = '<span class="badge badge--done">Done</span>';
    else if (isOverdue) badgeHtml = '<span class="badge badge--overdue">Overdue</span>';
    else if (isToday)   badgeHtml = '<span class="badge badge--today">Due today</span>';

    card.innerHTML = `
      <input
        class="task-checkbox"
        type="checkbox"
        aria-label="Mark as done"
        ${task.done ? 'checked' : ''}
        data-action="toggle"
        data-id="${task.id}"
      />
      <div class="task-body">
        <span class="task-subject">${escHtml(task.subject)}</span>
        <p class="task-description">${escHtml(task.description)}</p>
        <div class="task-meta">
          <span class="task-due ${isOverdue ? 'task-due--overdue' : isToday ? 'task-due--today' : ''}">
            📅 ${formatDate(task.dueDate) || 'No date'}
          </span>
          ${badgeHtml}
        </div>
      </div>
      <button
        class="task-delete"
        aria-label="Delete task"
        data-action="delete"
        data-id="${task.id}"
        title="Delete"
      >✕</button>
    `;

    fragment.appendChild(card);
  });

  taskList.appendChild(fragment);
}

/** Minimal HTML escaper — prevents XSS from user input */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Event: add task ──────────────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();

  const subject = inputSubject.value.trim();
  const desc    = inputDesc.value.trim();
  const date    = inputDate.value;

  // Simple validation
  let valid = true;
  [inputSubject, inputDesc, inputDate].forEach(el => el.classList.remove('input--error'));

  if (!subject) { inputSubject.classList.add('input--error'); valid = false; }
  if (!desc)    { inputDesc.classList.add('input--error');    valid = false; }
  if (!date)    { inputDate.classList.add('input--error');    valid = false; }

  if (!valid) return;

  addTask(subject, desc, date);
  form.reset();
  render();
  // Scroll to top of list smoothly
  taskList.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Clear error state on input
[inputSubject, inputDesc, inputDate].forEach(el => {
  el.addEventListener('input', () => el.classList.remove('input--error'));
});

// ── Event: toggle / delete (event delegation) ────────────────────────────
taskList.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const id     = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'toggle') {
    toggleDone(id);
    render();
  }

  if (action === 'delete') {
    // Brief fade-out before removal
    const card = taskList.querySelector(`.task-card[data-id="${id}"]`);
    if (card) {
      card.style.transition = 'opacity .15s ease, transform .15s ease';
      card.style.opacity    = '0';
      card.style.transform  = 'translateX(8px)';
      setTimeout(() => { deleteTask(id); render(); }, 150);
    } else {
      deleteTask(id);
      render();
    }
  }
});

// ── Event: filters / sort ────────────────────────────────────────────────
filterSubject.addEventListener('change', render);
filterStatus.addEventListener('change', render);
sortOrder.addEventListener('change', render);

// ── Boot ─────────────────────────────────────────────────────────────────
render();
