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
  if(localStream) {
    const track = localStream.getAudioTracks()[0];
    track.enabled = !track.enabled;
    document.getElementById('toggle-mic-btn').innerText = track.enabled ? 'Микрофон Вкл' : 'Микрофон Выкл';
  }
};

document.getElementById('share-screen-btn').onclick = async () => {
  if(isMobile) return alert('Демонстрация экрана доступна только на ПК');
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    addStream(screenStream, 'Экран');
    // TODO: отправка через WebRTC другим участникам
  } catch(e) { console.error(e); }
};

// ===== Инициализация комнаты =====
function initRoom(code, name) {
  currentRoom = code;
  socket.emit('join-room', { roomCode: code, displayName: localStorage.getItem('akbconf_name') }, res => {
    if(!res.ok) return alert(res.error);
    document.getElementById('participants').innerHTML = '';
    res.participants.forEach(p => addParticipant(p));
    generateQRCode(code);
  });
}

// ===== Участники =====
function addParticipant({id, displayName}) {
  const container = document.getElementById('participants');
  const div = document.createElement('div');
  div.classList.add('participant-item');
  div.innerText = displayName;
  container.appendChild(div);
}

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

socket.on('chat-message', data => {
  const log = document.getElementById('chat-log');
  const msgEl = document.createElement('div');
  if(data.type === 'file') {
    const link = document.createElement('a');
    link.href = data.text;
    link.target = '_blank';
    link.innerText = `Файл от ${data.fromName}`;
    msgEl.appendChild(link);
  } else msgEl.innerText = `${data.fromName}: ${data.text}`;
  log.appendChild(msgEl);
  log.scrollTop = log.scrollHeight;
});

// ===== Поделиться ссылкой =====
document.getElementById('share-link-btn').onclick = () => {
  const link = `${window.location.origin}?room=${currentRoom}`;
  prompt('Скопируйте ссылку для приглашения', link);
  generateQRCode(currentRoom);
};

// ===== Завершить комнату =====
document.getElementById('end-room-btn').onclick = () => {
  document.getElementById('room-modal').classList.add('hidden');
  const rooms = JSON.parse(localStorage.getItem('akbconf_rooms') || '[]');
  localStorage.setItem('akbconf_rooms', JSON.stringify(rooms.filter(r => r.code !== currentRoom)));
  currentRoom = null;
  loadRooms();
};
