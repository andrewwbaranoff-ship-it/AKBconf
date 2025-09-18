const API = 'https://akbserver-1.onrender.com';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

document.getElementById('show-register').onclick = () => {
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
};
document.getElementById('show-login').onclick = () => {
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
};

document.getElementById('register-btn').onclick = async () => {
  const name = document.getElementById('register-name').value;
  const login = document.getElementById('register-login').value;
  const password = document.getElementById('register-password').value;
  const res = await fetch(`${API}/api/register`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, login, password })
  });
  const data = await res.json();
  if(data.ok) alert('Регистрация успешна'); else document.getElementById('register-error').innerText = data.error;
};

document.getElementById('login-btn').onclick = async () => {
  const login = document.getElementById('login-login').value;
  const password = document.getElementById('login-password').value;
  const res = await fetch(`${API}/api/login`, {
    method: 'POST', headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ login, password })
  });
  const data = await res.json();
  if(data.ok) {
    localStorage.setItem('akbconf_token', data.token);
    localStorage.setItem('akbconf_name', data.name);
    showConferenceUI(data.name);
  } else document.getElementById('login-error').innerText = data.error;
};

// Проверка токена при загрузке
window.onload = () => {
  const token = localStorage.getItem('akbconf_token');
  const name = localStorage.getItem('akbconf_name');
  if(token && name) showConferenceUI(name);
};

function showConferenceUI(name) {
  document.getElementById('auth-container').classList.add('hidden');
  document.getElementById('conference-container').classList.remove('hidden');
  document.getElementById('room-title').innerText = `Привет, ${name}`;
}
