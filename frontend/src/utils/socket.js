import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    return socket;
  }

  const url = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  socket = io(url, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('✅ Socket подключен:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Ошибка подключения к сокету:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ Socket отключён:', reason);
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket ещё не инициализирован!');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket отключён вручную');
  }
};
