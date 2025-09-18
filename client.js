const socket = io('https://akbserver-1.onrender.com');
let localStream = null;
let peers = {};
let currentChatCode = null;

// Открытие чата
function openChat(code, name) {
  currentChatCode = code;
  document.getElementById('chat-title').innerText = name;
  document.getElementById('chat-modal').classList.remove('hidden');
  joinRoom(code);
}

async function joinRoom(code) {
  const displayName = localStorage.getItem('akbconf_name');
  localStream = await navigator.mediaDevices.getUserMedia({audio:true});
  socket.emit('join-room', {roomCode: code, displayName}, ({ok, participants}) => {
    participants.forEach(p => { if(p.id !== socket.id) createPeer(p.id); });
  });
}

// Создание PeerConnection
function createPeer(peerId) {
  const pc = new RTCPeerConnection();
  localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  pc.ontrack = event => {
    const audioEl = document.createElement('audio');
    audioEl.srcObject = event.streams[0];
    audioEl.autoplay = true;
    document.getElementById('streams-container').appendChild(audioEl);
  };
  pc.onicecandidate = e => {
    if(e.candidate) socket.emit('signal', {to: peerId, signal:e.candidate});
  };
  peers[peerId] = pc;
}

// Приём сигналинга
socket.on('signal', async data => {
  let pc = peers[data.from];
  if(!pc) { createPeer(data.from); pc = peers[data.from]; }
  if(data.signal.candidate) await pc.addIceCandidate(data.signal);
  else if(data.signal.sdp) await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
});

// Чат
document.getElementById('send-chat-btn').onclick = () => {
  const text = document.getElementById('chat-input').value;
  if(!text) return;
  const data = {roomCode: currentChatCode, text, type:'text', fromName: localStorage.getItem('akbconf_name')};
  socket.emit('chat-message', data);
  addChatMessage(data);
  document.getElementById('chat-input').value = '';
};

socket.on('chat-message', data => addChatMessage(data));

function addChatMessage(data) {
  const log = document.getElementById('chat-log');
  const div = document.createElement('div');
  div.innerText = `${data.fromName}: ${data.text}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

// Управление микрофоном
let micEnabled = true;
document.getElementById('toggle-mic-btn').onclick = () => {
  localStream.getAudioTracks()[0].enabled = !micEnabled;
  micEnabled = !micEnabled;
};

// Демонстрация экрана
document.getElementById('share-screen-btn').onclick = async () => {
  const screenStream = await navigator.mediaDevices.getDisplayMedia({video:true});
  Object.values(peers).forEach(pc => {
    screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
  });
  screenStream.getVideoTracks()[0].onended = () => { console.log('Screen sharing ended'); };
};
