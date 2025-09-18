// Минимальный пример генерации QR-кода (использует QRCode.js библиотеку)
function generateQRCode(roomCode) {
  const qrContainer = document.getElementById('qr-code');
  if(!qrContainer) return;
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, `${window.location.origin}?room=${roomCode}`);
}
