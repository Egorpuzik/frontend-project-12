import { io } from 'socket.io-client';
import { addChannel, removeChannel, renameChannel, setCurrentChannelId } from '../store/channelsSlice.js';

let socket = null;

const setupSocket = (store) => {
  socket = io();

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('newChannel', (payload) => {
    store.dispatch(addChannel(payload));
    store.dispatch(setCurrentChannelId(payload.id)); 
  });

  socket.on('removeChannel', (payload) => {
    store.dispatch(removeChannel(payload));
  });

  socket.on('renameChannel', (payload) => {
    store.dispatch(renameChannel(payload));
  });
};

export const emitNewChannel = (data, callback) => {
  socket.emit('newChannel', data, callback);
};

export const emitRemoveChannel = (data, callback) => {
  socket.emit('removeChannel', data, callback);
};

export const emitRenameChannel = (data, callback) => {
  socket.emit('renameChannel', data, callback);
};

export default setupSocket;
