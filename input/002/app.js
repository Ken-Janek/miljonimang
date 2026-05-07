const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const clearBtn = document.getElementById('clearBtn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

const STORAGE_KEY = 'todos';

// Load todos on page load
document.addEventListener('DOMContentLoaded', loadTodos);

// Event listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});
clearBtn.addEventListener('click', clearCompleted);

function addTodo() {
    const text = todoInput.value.trim();
    
    if (!text) {
        alert('Palun sisesta ülesanne!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false
    };

    const todos = getTodos();
    todos.push(todo);
    saveTodos(todos);

    todoInput.value = '';
    renderTodos();
    todoInput.focus();
}

function deleteTodo(id) {
    const todos = getTodos();
    const filtered = todos.filter(todo => todo.id !== id);
    saveTodos(filtered);
    renderTodos();
}

function toggleTodo(id) {
    const todos = getTodos();
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos(todos);
        renderTodos();
    }
}

function clearCompleted() {
    const todos = getTodos();
    const filtered = todos.filter(todo => !todo.completed);
    saveTodos(filtered);
    renderTodos();
}

function renderTodos() {
    const todos = getTodos();
    todoList.innerHTML = '';

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${todo.text}</span>
            <button class="delete-btn" onclick="deleteTodo(${todo.id})">Kustuta</button>
        `;

        todoList.appendChild(li);
    });

    updateStats();
}

function updateStats() {
    const todos = getTodos();
    const completed = todos.filter(t => t.completed).length;
    
    totalCount.textContent = todos.length;
    completedCount.textContent = completed;
    pendingCount.textContent = todos.length - completed;
}

function getTodos() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTodos(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadTodos() {
    renderTodos();
}
