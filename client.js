const socket = io('https://ваш-сервер-на-render'); // по умолчанию
let localStream = null;
let screenStream = null;
let peers = {};
let currentRoom = null;

const btnCreate = document.getElementById('btn-create');
const btnJoin = document.getElementById('btn-join');
const inputRoom = document.getElementById('input-room');
const participantsList = document.getElementById('participants-list');
const remoteAudioList = document.getElementById('remote-audio-list');
const btnMute = document.getElementById('btn-mute');
const btnScreen = document.getElementById('btn-screen');
const screenPreviewWrap = document.getElementById('screen-preview-wrap');
const screenPreview = document.getElementById('screen-preview');
let isMuted = false;

async function initLocalAudio() {
  localStream = await navigator.mediaDevices.getUserMedia({ audio:true });
}

btnCreate.addEventListener('click', async () => {
  await initLocalAudio();
  const roomCode = inputRoom.value.trim();
  socket.emit('create-room', { roomCode, title: roomCode }, res=>{
    if(res.ok) joinRoom(roomCode);
    else alert(res.error);
  });
});

btnJoin.addEventListener('click', async () => {
  await initLocalAudio();
  const roomCode = inputRoom.value.trim();
  joinRoom(roomCode);
});

async function joinRoom(roomCode){
  currentRoom = roomCode;
  socket.emit('join-room', { roomCode, displayName: localStorage.getItem('akbconf_name') }, res=>{
    if(res.ok){
      updateParticipants(res.participants);
      document.getElementById('room').classList.remove('hidden');
    } else alert(res.error);
  });
}

function updateParticipants(participants){
  participantsList.innerHTML = '';
  participants.forEach(p => {
    const div = document.createElement('div');
    div.textContent = p.displayName;
    participantsList.appendChild(div);
  });
}

// Socket.IO сигналы
socket.on('peer-joined', async ({id, displayName}) => {
  const pc = new RTCPeerConnection();
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.onicecandidate = e => {
    if(e.candidate) socket.emit('ice-candidate', { target: id, candidate: e.candidate });
  };
  pc.ontrack = e => {
    let audio = document.getElementById('audio-'+id);
    if(!audio){
      audio = document.createElement('audio');
      audio.id = 'audio-'+id;
      audio.autoplay = true;
      remoteAudioList.appendChild(audio);
    }
    audio.srcObject = e.streams[0];
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  socket.emit('offer', { target: id, sdp: offer });
  peers[id] = pc;
});

socket.on('offer', async ({from, sdp})=>{
  const pc = new RTCPeerConnection();
  localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

  pc.onicecandidate = e => {
    if(e.candidate) socket.emit('ice-candidate', { target: from, candidate: e.candidate });
  };
  pc.ontrack = e => {
    let audio = document.getElementById('audio-'+from);
    if(!audio){
      audio = document.createElement('audio');
      audio.id = 'audio-'+from;
      audio.autoplay = true;
      remoteAudioList.appendChild(audio);
    }
    audio.srcObject = e.streams[0];
  };

  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  socket.emit('answer', { target: from, sdp: answer });
  peers[from] = pc;
});

socket.on('answer', async ({from, sdp})=>{
  const pc = peers[from];
  if(pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
});

socket.on('ice-candidate', ({from, candidate})=>{
  const pc = peers[from];
  if(pc) pc.addIceCandidate(new RTCIceCandidate(candidate));
});

btnMute.addEventListener('click', ()=>{
  if(localStream){
    localStream.getAudioTracks().forEach(t => t.enabled = isMuted);
    isMuted = !isMuted;
    btnMute.textContent = isMuted ? 'Вкл. микрофон' : 'Откл. микрофон';
  }
});

btnScreen.addEventListener('click', async ()=>{
  if(screenStream){
    stopScreen();
    return;
  }
  screenStream = await navigator.mediaDevices.getDisplayMedia({ video:true });
  screenPreview.srcObject = screenStream;
  screenPreviewWrap.classList.remove('hidden');
  Object.values(peers).forEach(pc=>{
    screenStream.getTracks().forEach(track => pc.addTrack(track, screenStream));
  });
  screenStream.getVideoTracks()[0].onended = stopScreen;
});

function stopScreen(){
  if(!screenStream) return;
  screenStream.getTracks().forEach(t => t.stop());
  screenPreviewWrap.classList.add('hidden');
  screenPreview.srcObject = null;
  screenStream = null;
}