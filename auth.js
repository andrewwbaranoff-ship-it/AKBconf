let token = null;
const API = 'https://ваш-сервер-на-render'; // по умолчанию, админ может поменять

const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const nameInput = document.getElementById('name');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const msgEl = document.getElementById('auth-msg');
const authContainer = document.getElementById('auth-container');
const confContainer = document.getElementById('conference-container');
const welcomeEl = document.getElementById('welcome');

btnRegister.addEventListener('click', async () => {
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();
  const name = nameInput.value.trim();
  const res = await fetch(API + '/api/register', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ login, password, name })
  });
  const data = await res.json();
  msgEl.textContent = data.ok ? 'Регистрация успешна' : data.error;
});

btnLogin.addEventListener('click', async () => {
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();
  const res = await fetch(API + '/api/login', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ login, password })
  });
  const data = await res.json();
  if(data.ok){
    token = data.token;
    authContainer.classList.add('hidden');
    confContainer.classList.remove('hidden');
    welcomeEl.textContent = `Привет, ${data.name}`;
    localStorage.setItem('akbconf_token', token);
    localStorage.setItem('akbconf_name', data.name);
  } else {
    msgEl.textContent = data.error;
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  token = null;
  localStorage.removeItem('akbconf_token');
  localStorage.removeItem('akbconf_name');
  confContainer.classList.add('hidden');
  authContainer.classList.remove('hidden');
});