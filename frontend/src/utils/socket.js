import { io } from 'socket.io-client';

const token = localStorage.getItem('token');

const socket = io('/', {
  auth: {
    token,
  },
  autoConnect: true,
});

export default socket;
