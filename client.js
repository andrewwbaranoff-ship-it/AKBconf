// Укажи здесь URL своего сигнального сервера
const SIGNALING_SERVER = "https://akbserver.onrender.com";
const socket = io(SIGNALING_SERVER, { transports: ['websocket'] });

// Тут нужно вставить остальной JS код (обработчики, WebRTC логика) который я описывал выше.
// Чтобы не перегружать здесь, предполагаем, что основной код client.js будет вставлен вами.
