const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter");

const todayEl = document.getElementById("today");
const activeCountEl = document.getElementById("activeCount");
const doneCountEl = document.getElementById("doneCount");

// User UI
const userTitle = document.getElementById("userTitle");
const avatarEl = document.getElementById("avatar");
const changeNameBtn = document.getElementById("changeNameBtn");

// LocalStorage keys
const STORAGE_KEY = "todo.tasks.v3";
const USER_KEY = "todo.username.v1";

let tasks = loadTasks();
let filter = "all";

// show today's date
todayEl.textContent = new Date().toLocaleDateString(undefined, {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric"
});

// Load username + update UI
loadUser();
render();

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

changeNameBtn.addEventListener("click", () => {
  const newName = prompt("Enter your name:");
  if (newName === null) return;

  const clean = newName.trim();
  if (!clean) return;

  localStorage.setItem(USER_KEY, clean);
  loadUser();
});

function getInitials(name){
  const cleaned = String(name || "").trim();
  if (!cleaned) return "?";

  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  const initials = (first + last).toUpperCase();

  return initials || cleaned[0].toUpperCase();
}

function loadUser(){
  let name = localStorage.getItem(USER_KEY);

  if (!name){
    name = prompt("Welcome! What is your name?");
    if (name === null) name = "User";
    name = name.trim() || "User";
    localStorage.setItem(USER_KEY, name);
  }

  userTitle.textContent = `${name}’s To-Do App`;
  avatarEl.textContent = getInitials(name);
  taskInput.placeholder = `What are you working on today, ${name}?...`;
  document.title = `${name} — To-Do App`;
}

function addTask(){
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: Date.now()
  });

  taskInput.value = "";
  saveTasks();
  render();
}

function toggleTask(id){
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks();
  render();
}

function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function editTask(id){
  const t = tasks.find(x => x.id === id);
  if (!t) return;

  const next = prompt("Edit task:", t.text);
  if (next === null) return;
  const text = next.trim();
  if (!text) return;

  t.text = text;
  saveTasks();
  render();
}

function filteredTasks(){
  if (filter === "active") return tasks.filter(t => !t.done);
  if (filter === "completed") return tasks.filter(t => t.done);
  return tasks;
}

function render(){
  const visible = filteredTasks();

  listEl.innerHTML = "";
  visible.forEach(task => {
    const li = document.createElement("li");
    li.className = "item";

    const box = document.createElement("div");
    box.className = "checkbox" + (task.done ? " done" : "");
    box.title = "Toggle complete";
    box.innerHTML = task.done ? "✓" : "";
    box.addEventListener("click", () => toggleTask(task.id));

    const title = document.createElement("div");
    title.className = "title" + (task.done ? " done" : "");
    title.textContent = task.text;
    title.addEventListener("dblclick", () => editTask(task.id));

    const actions = document.createElement("div");
    actions.className = "actions";

    const edit = document.createElement("button");
    edit.className = "iconBtn";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => editTask(task.id));

    const del = document.createElement("button");
    del.className = "iconBtn danger";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    actions.append(edit, del);
    li.append(box, title, actions);
    listEl.appendChild(li);
  });

  const activeCount = tasks.filter(t => !t.done).length;
  const doneCount = tasks.filter(t => t.done).length;

  countEl.textContent = `${activeCount} item${activeCount === 1 ? "" : "s"} left`;
  activeCountEl.textContent = activeCount;
  doneCountEl.textContent = doneCount;
}

function saveTasks(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch{
    return [];
  }
}
