const socket = io('https://akbserver-1.onrender.com');
let localStream;
let peers = {};
let currentRoom = null;
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

// ===== Инициализация микрофона =====
async function initAudio() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch(e) {
    alert('Не удалось получить микрофон');
  }
}
initAudio();

// ===== Кнопки микрофон и демонстрация экрана =====
document.getElementById('toggle-mic-btn').onclick = () => {
  if(localStream) localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
};

document.getElementById('share-screen-btn').onclick = async () => {
  if(isMobile) return alert('Демонстрация экрана доступна только на ПК');
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    addStream(screenStream, 'Экран');
    // Отправляем всем участникам через WebRTC (понадобится PeerConnection для каждого)
  } catch(e) { console.error(e); }
};

// ===== Комнаты =====
document.getElementById('create-room-btn').onclick = async () => {
  const roomCode = Math.random().toString(36).substr(2,6).toUpperCase();
  currentRoom = roomCode;
  socket.emit('create-room', { roomCode, title: `Комната ${roomCode}` }, res => {
    if(res.ok) alert(`Комната создана: ${roomCode}`);
    generateQRCode(roomCode);
  });
};

document.getElementById('join-room-btn').onclick = () => {
  const roomCode = document.getElementById('room-code-input').value.toUpperCase();
  if(!roomCode) return alert('Введите код комнаты');
  currentRoom = roomCode;
  socket.emit('join-room', { roomCode, displayName: localStorage.getItem('akbconf_name') }, res => {
    if(res.ok) alert(`Вы присоединились к комнате ${roomCode}`);
    generateQRCode(roomCode);
  });
};

// ===== Скопировать ссылку =====
document.getElementById('copy-link-btn').onclick = () => {
  const link = `${window.location.origin}?room=${currentRoom}`;
  navigator.clipboard.writeText(link);
  alert('Ссылка скопирована!');
};

// ===== Чат =====
document.getElementById('send-chat-btn').onclick = () => {
  const input = document.getElementById('chat-input');
  const fileInput = document.getElementById('chat-file-input');
  if(fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('chat-message', {
        roomCode: currentRoom,
        text: reader.result,
        type: 'file',
        fromName: localStorage.getItem('akbconf_name')
      });
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  } else if(input.value.trim() !== '') {
    socket.emit('chat-message', {
      roomCode: currentRoom,
      text: input.value,
      type: 'text',
      fromName: localStorage.getItem('akbconf_name')
    });
    input.value = '';
  }
};

// ===== Получение сообщений =====
socket.on('chat-message', data => {
  const log = document.getElementById('chat-log');
  let msgEl = document.createElement('div');
  msgEl.classList.add('chat-message');
  if(data.type === 'file') {
    const link = document.createElement('a');
    link.href = data.text;
    link.target = '_blank';
    link.innerText = `Файл от ${data.fromName}`;
    msgEl.appendChild(link);
  } else {
    msgEl.innerText = `${data.fromName}: ${data.text}`;
  }
  log.appendChild(msgEl);
  log.scrollTop = log.scrollHeight;
});

// ===== Потоки участников =====
function addStream(stream, label) {
  const container = document.getElementById('streams-container');
  const videoEl = document.createElement('video');
  videoEl.srcObject = stream;
  videoEl.autoplay = true;
  videoEl.playsInline = true;
  videoEl.controls = false;
  const wrapper = document.createElement('div');
  const lbl = document.createElement('div');
  lbl.innerText = label;
  wrapper.appendChild(lbl);
  wrapper.appendChild(videoEl);
  container.appendChild(wrapper);
}
