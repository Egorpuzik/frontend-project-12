import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatData, newMessage, addChannel, removeChannel, renameChannel } from '../store/chatSlice.js';
import { initSocket, getSocket } from '../utils/socket.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { channels = [], messages = [], status = 'idle' } = useSelector((state) => state.chat || {});

  const [messageText, setMessageText] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  useEffect(() => {
    if (channels.length > 0 && !currentChannel) {
      setCurrentChannel(channels.find((c) => c.name === 'general') || channels[0]);
    }
  }, [channels, currentChannel]);

  useEffect(() => {
    initSocket();
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => dispatch(newMessage(message));
    const handleNewChannel = (channel) => dispatch(addChannel(channel));
    const handleRemoveChannel = ({ id }) => dispatch(removeChannel(id));
    const handleRenameChannel = (channel) => dispatch(renameChannel(channel));

    const handleDisconnect = () => setDisconnected(true);
    const handleConnect = () => setDisconnected(false);

    socket.on('newMessage', handleNewMessage);
    socket.on('newChannel', handleNewChannel);
    socket.on('removeChannel', handleRemoveChannel);
    socket.on('renameChannel', handleRenameChannel);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newChannel', handleNewChannel);
      socket.off('removeChannel', handleRemoveChannel);
      socket.off('renameChannel', handleRenameChannel);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
    };
  }, [dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentChannel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket || !messageText.trim() || !currentChannel) return;

    socket.emit(
      'newMessage',
      {
        body: messageText.trim(),
        channelId: currentChannel.id,
        username: user?.username,
      },
      (response) => {
        if (response.status === 'ok') {
          setMessageText('');
        }
      }
    );
  };

  if (status === 'loading') return <div>Загрузка чата...</div>;
  if (!currentChannel) return <div>Нет доступных каналов</div>;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div style={{ width: '250px', background: '#f8f9fa', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>Каналы</div>
        <ul style={{ listStyle: 'none', padding: '10px', margin: 0, flex: 1 }}>
          {channels.map((channel) => (
            <li
              key={channel.id}
              onClick={() => setCurrentChannel(channel)}
              style={{
                cursor: 'pointer',
                padding: '8px 12px',
                textAlign: 'left',
                background: currentChannel.id === channel.id ? '#e9ecef' : 'transparent',
                borderRadius: '5px',
                marginBottom: '3px',
                fontWeight: currentChannel.id === channel.id ? 'bold' : 'normal',
              }}
            >
              #{channel.name}
            </li>
          ))}
        </ul>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
          #{currentChannel.name}
        </div>

        {/* СООБЩЕНИЯ */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', background: '#fff' }}>
          {messages
            .filter((m) => m.channelId === currentChannel.id)
            .map((message) => (
              <div key={message.id} style={{ marginBottom: '10px' }}>
                <strong>{message.username}:</strong> {message.body}
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        {/* ВВОД СООБЩЕНИЯ */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #ddd', background: '#f8f9fa' }}>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Введите сообщение..."
            style={{ flex: 1, marginRight: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
            disabled={disconnected}
          />
          <button
            type="submit"
            disabled={disconnected || !currentChannel}
            style={{ padding: '10px 20px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
};

export default HomePage;
