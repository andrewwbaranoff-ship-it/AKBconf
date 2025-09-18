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
  loadRooms();
}

function loadRooms() {
  const roomsList = document.getElementById('rooms-list');
  roomsList.innerHTML = '';
  const savedRooms = JSON.parse(localStorage.getItem('akbconf_rooms') || '[]');
  savedRooms.forEach(room => {
    const div = document.createElement('div');
    div.classList.add('room-item');
    div.innerText = room.name;
    div.onclick = () => openRoom(room.code, room.name);
    roomsList.appendChild(div);
  });
}

// Модальные окна
document.getElementById('create-room-btn').onclick = () => {
  document.getElementById('create-room-modal').classList.remove('hidden');
};
document.getElementById('cancel-create-room-btn').onclick = () => {
  document.getElementById('create-room-modal').classList.add('hidden');
};
document.getElementById('confirm-create-room-btn').onclick = () => {
  const name = document.getElementById('room-name-input').value.trim();
  if(!name) return alert('Введите название комнаты');
  const code = Math.random().toString(36).substr(2,6).toUpperCase();
  const savedRooms = JSON.parse(localStorage.getItem('akbconf_rooms') || '[]');
  savedRooms.push({name, code});
  localStorage.setItem('akbconf_rooms', JSON.stringify(savedRooms));
  document.getElementById('create-room-modal').classList.add('hidden');
  openRoom(code, name);
};

function openRoom(code, name) {
  document.getElementById('room-modal').classList.remove('hidden');
  document.getElementById('room-title').innerText = name;
  initRoom(code, name);
}
