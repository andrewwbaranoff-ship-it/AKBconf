const socket = io('https://akbserver-1.onrender.com');

let localStream;
let peers = {};
let currentRoom = null;

// Аудио
async function initAudio() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch(e) { alert('Не удалось получить микрофон'); }
}

// Кнопка микрофон
document.getElementById('toggle-mic-btn').onclick = () => {
  if(localStream) localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
};

// Кнопка демонстрации экрана (только десктоп)
document.getElementById('share-screen-btn').onclick = async () => {
  if(window.navigator.userAgent.match(/Mobi/)) { alert('Демонстрация экрана доступна только на десктопе'); return; }
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    // Добавить в PeerConnection других участников
  } catch(e) { console.error(e); }
};

// Создать комнату
document.getElementById('create-room-btn').onclick = async () => {
  const roomCode = Math.random().toString(36).substr(2,6).toUpperCase();
  currentRoom = roomCode;
  socket.emit('create-room', { roomCode, title: `Комната ${roomCode}` }, res => {
    if(res.ok) alert(`Комната создана: ${roomCode}`);
  });
};

// Присоединиться к комнате
document.getElementById('join-room-btn').onclick = () => {
  const roomCode = document.getElementById('room-code-input').value.toUpperCase();
  if(!roomCode) return alert('Введите код комнаты');
  currentRoom = roomCode;
  socket.emit('join-room', { roomCode, displayName: localStorage.getItem('akbconf_name') }, res => {
    if(res.ok) alert(`Вы присоединились к комнате ${roomCode}`);
    else alert(res.error);
  });
};

// Кнопка копирования ссылки
document.getElementById('copy-link-btn').onclick = () => {
  const link = `${window.location.origin}?room=${currentRoom}`;
  navigator.clipboard.writeText(link);
  alert('Ссылка скопирована!');
};
