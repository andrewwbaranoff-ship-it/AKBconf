const API = 'https://akbserver-1.onrender.com';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const dashboard = document.getElementById('dashboard-container');

document.getElementById('show-register').onclick = () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
};
document.getElementById('show-login').onclick = () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
};

// Регистрация
document.getElementById('register-btn').onclick = async () => {
  const name = document.getElementById('register-name').value;
  const login = document.getElementById('register-login').value;
  const password = document.getElementById('register-password').value;
  const res = await fetch(`${API}/api/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name, login, password})
  });
  const data = await res.json();
  if(data.ok) alert('Регистрация успешна'); 
  else document.getElementById('register-error').innerText = data.error;
};

// Вход
document.getElementById('login-btn').onclick = async () => {
  const login = document.getElementById('login-login').value;
  const password = document.getElementById('login-password').value;
  const res = await fetch(`${API}/api/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({login, password})
  });
  const data = await res.json();
  if(data.ok) {
    localStorage.setItem('akbconf_token', data.token);
    localStorage.setItem('akbconf_name', data.name);
    showDashboard(data.name);
  } else document.getElementById('login-error').innerText = data.error;
};

// Проверка сессии
window.onload = () => {
  const token = localStorage.getItem('akbconf_token');
  const name = localStorage.getItem('akbconf_name');
  if(token && name) showDashboard(name);
};

function showDashboard(name) {
  document.getElementById('auth-container').classList.add('hidden');
  dashboard.classList.remove('hidden');
  loadChats();
}

function loadChats() {
  const chatsList = document.getElementById('chats-list');
  chatsList.innerHTML = '';
  const savedChats = JSON.parse(localStorage.getItem('akbconf_chats') || '[]');
  savedChats.forEach(chat => {
    const div = document.createElement('div');
    div.classList.add('chat-item');
    div.innerText = chat.name;
    div.onclick = () => openChat(chat.code, chat.name);
    chatsList.appendChild(div);
  });
}

// Модальные окна
document.getElementById('create-chat-btn').onclick = () => {
  document.getElementById('create-chat-modal').classList.remove('hidden');
};
document.getElementById('cancel-create-chat-btn').onclick = () => {
  document.getElementById('create-chat-modal').classList.add('hidden');
};
document.getElementById('confirm-create-chat-btn').onclick = () => {
  const name = document.getElementById('chat-name-input').value;
  const code = 'chat-' + Date.now();
  const savedChats = JSON.parse(localStorage.getItem('akbconf_chats') || '[]');
  savedChats.push({name, code});
  localStorage.setItem('akbconf_chats', JSON.stringify(savedChats));
  document.getElementById('create-chat-modal').classList.add('hidden');
  loadChats();
  openChat(code, name);
};
