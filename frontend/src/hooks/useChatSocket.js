import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import socket from '../socket';
import { newMessage, addChannel, removeChannel, renameChannel } from '../store/chatSlice';

const useChatSocket = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    socket.on('newMessage', (message) => {
      dispatch(newMessage(message));
    });

    socket.on('newChannel', (channel) => {
      dispatch(addChannel(channel));
    });

    socket.on('removeChannel', ({ id }) => {
      dispatch(removeChannel(id));
    });

    socket.on('renameChannel', (channel) => {
      dispatch(renameChannel(channel));
    });

    return () => {
      socket.off('newMessage');
      socket.off('newChannel');
      socket.off('removeChannel');
      socket.off('renameChannel');
    };
  }, [dispatch]);
};

export default useChatSocket;
