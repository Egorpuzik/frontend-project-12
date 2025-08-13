import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  if (socket && !socket.connected) {
    socket.auth = { token };
    socket.connect();
    return socket;
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
    if (reason === 'io server disconnect') {
      console.log('Попытка переподключения...');
      socket.connect();
    } else if (reason === 'io client disconnect') {
      console.log('Отключение инициировано клиентом.');
    } else if (reason === 'ping timeout') {
      console.log('Таймаут пинга — проблемы с сетью.');
    } else {
      console.log('Причина отключения:', reason);
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket отключён вручную');
  }
};
