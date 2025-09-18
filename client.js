const SIGNAL_SERVER = 'https://akbserver-1.onrender.com';
const socket = io(SIGNAL_SERVER);

let localStream = null, screenStream = null, peers = {}, currentRoom = null, isMuted = false;

const btnCreate = document.getElementById('btn-create');
const btnJoin = document.getElementById('btn-join');
const inputRoom = document.getElementById('input-room');
const participantsList = document.getElementById('participants-list');
const remoteAudioList = document.getElementById('remote-audio-list');
const btnMute = document.getElementById('btn-mute');
const btnScreen = document.getElementById('btn-screen');
const screenPreviewWrap = document.getElementById('screen-preview-wrap');
const screenPreview = document.getElementById('screen-preview');
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');

async function initLocalAudio(){ 
  try {
    localStream = await navigator.mediaDevices.getUserMedia({audio:true});
  } catch (e) {
    alert('Нужен доступ к микрофону');
    throw e;
  }
}

btnCreate.onclick = async () => {
  await initLocalAudio();
  socket.emit('create-room',{roomCode:inputRoom.value,title:inputRoom.value},res=>{ if(res.ok) joinRoom(inputRoom.value); else alert(res.error); });
};
btnJoin.onclick = async () => {
  await initLocalAudio(); joinRoom(inputRoom.value);
};

function joinRoom(roomCode){
  if(!roomCode) return alert('Введите код комнаты');
  currentRoom = roomCode;
  socket.emit('join-room',{roomCode,displayName:localStorage.getItem('akbconf_name')},res=>{
    if(res.ok){ updateParticipants(res.participants); document.getElementById('room').classList.remove('hidden'); }
    else alert(res.error);
  });
}

function updateParticipants(list){
  participantsList.innerHTML='';
  list.forEach(p=>{
    const div=document.createElement('div');
    div.className='participant';
    div.innerHTML=`<i class="fas fa-microphone" style="color:lime"></i> <span>${p.displayName}</span>`;
    participantsList.appendChild(div);
  });
}

socket.on('peer-joined', async ({id,displayName})=>{
  const pc=new RTCPeerConnection();
  localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  pc.onicecandidate=e=>{ if(e.candidate) socket.emit('ice-candidate',{target:id,candidate:e.candidate}); };
  pc.ontrack=e=>{
    let audio=document.getElementById('audio-'+id);
    if(!audio){ audio=document.createElement('audio'); audio.id='audio-'+id; audio.autoplay=true; remoteAudioList.appendChild(audio); }
    audio.srcObject=e.streams[0];
  };
  const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
  socket.emit('offer',{target:id,sdp:offer}); peers[id]=pc;
});

socket.on('offer',async({from,sdp})=>{
  const pc=new RTCPeerConnection();
  localStream.getTracks().forEach(t=>pc.addTrack(t,localStream));
  pc.onicecandidate=e=>{ if(e.candidate) socket.emit('ice-candidate',{target:from,candidate:e.candidate}); };
  pc.ontrack=e=>{
    let audio=document.getElementById('audio-'+from);
    if(!audio){ audio=document.createElement('audio'); audio.id='audio-'+from; audio.autoplay=true; remoteAudioList.appendChild(audio); }
    audio.srcObject=e.streams[0];
  };
  await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  const ans=await pc.createAnswer(); await pc.setLocalDescription(ans);
  socket.emit('answer',{target:from,sdp:ans}); peers[from]=pc;
});

socket.on('answer',async({from,sdp})=>{ if(peers[from]) await peers[from].setRemoteDescription(new RTCSessionDescription(sdp)); });
socket.on('ice-candidate',({from,candidate})=>{ if(peers[from]) peers[from].addIceCandidate(new RTCIceCandidate(candidate)); });

btnMute.onclick=()=>{
  if(localStream){ localStream.getAudioTracks().forEach(t=>t.enabled=isMuted); isMuted=!isMuted; btnMute.innerHTML=isMuted?'<i class="fas fa-microphone-slash"></i> Вкл. микрофон':'<i class="fas fa-microphone"></i> Откл. микрофон'; }
};
btnScreen.onclick=async()=>{
  if(screenStream){ stopScreen(); return; }
  screenStream=await navigator.mediaDevices.getDisplayMedia({video:true});
  screenPreview.srcObject=screenStream; screenPreviewWrap.classList.remove('hidden');
  Object.values(peers).forEach(pc=>{ screenStream.getTracks().forEach(track=>pc.addTrack(track,screenStream)); });
  screenStream.getVideoTracks()[0].onended=()=>stopScreen();
};
function stopScreen(){ if(!screenStream)return; screenStream.getTracks().forEach(t=>t.stop()); screenStream=null; screenPreview.srcObject=null; screenPreviewWrap.classList.add('hidden'); }

chatSend.onclick=()=>{ const text=chatInput.value.trim(); if(text){ socket.emit('chat-message',{roomCode:currentRoom,text,fromName:localStorage.getItem('akbconf_name')}); chatInput.value=''; } };
socket.on('chat-message',({fromName,text})=>{ const div=document.createElement('div'); div.textContent=`${fromName}: ${text}`; chatLog.appendChild(div); chatLog.scrollTop=chatLog.scrollHeight; });
