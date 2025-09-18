const API = 'https://akbserver-1.onrender.com';

const loginEl = document.getElementById('login');
const passEl = document.getElementById('password');
const nameEl = document.getElementById('name');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const msgEl = document.getElementById('auth-msg');
const modal = document.getElementById('auth-modal');
const confContainer = document.getElementById('conference-container');
const welcomeEl = document.getElementById('welcome');
const btnLogout = document.getElementById('btn-logout');

let token = null;

btnRegister.onclick = async () => {
  const res = await fetch(API+'/api/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:loginEl.value,password:passEl.value,name:nameEl.value})});
  const data = await res.json();
  msgEl.textContent = data.ok ? 'Регистрация успешна' : data.error;
};

btnLogin.onclick = async () => {
  const res = await fetch(API+'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:loginEl.value,password:passEl.value})});
  const data = await res.json();
  if(data.ok){
    token = data.token;
    localStorage.setItem('akbconf_token', token);
    localStorage.setItem('akbconf_name', data.name);
    modal.classList.remove('active');
    confContainer.classList.remove('hidden');
    welcomeEl.textContent = `Привет, ${data.name}`;
  } else msgEl.textContent = data.error;
};

btnLogout.onclick = () => {
  token = null;
  localStorage.clear();
  confContainer.classList.add('hidden');
  modal.classList.add('active');
};
