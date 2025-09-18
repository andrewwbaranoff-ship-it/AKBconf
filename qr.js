function generateQR(text) {
  const qrContainer = document.getElementById('qr-container');
  qrContainer.innerHTML = '';
  new QRCode(qrContainer, text);
}
document.getElementById('share-link-btn').onclick = () => {
  const link = window.location.href + '?chat=' + currentChatCode;
  navigator.clipboard.writeText(link);
  generateQR(link);
  alert('Ссылка скопирована!');
};
