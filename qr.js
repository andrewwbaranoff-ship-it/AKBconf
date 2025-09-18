// QR-код генерация
function generateQRCode(roomCode) {
  const container = document.getElementById('qr-container');
  container.innerHTML = '';
  const qr = document.createElement('div');
  container.appendChild(qr);
  new QRCode(qr, `${window.location.origin}?room=${roomCode}`);
}
