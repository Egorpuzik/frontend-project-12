import { io } from 'socket.io-client';

let socket = null;

export const initSocket = () => {
  const token = localStorage.getItem('token');

  if (socket) {
    socket.disconnect();
  }

  socket = io('/', {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect_error', (err) => {
    console.error('Ошибка подключения к сокету:', err.message);
  });

  socket.on('connect', () => {
    console.log('✅ Socket подключен:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ Socket отключён:', reason);
  });
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket отключён вручную');
  }
};

