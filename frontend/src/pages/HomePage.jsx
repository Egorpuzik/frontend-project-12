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
  const [activeChannel, setActiveChannel] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  useEffect(() => {
    initSocket();
    const socket = getSocket();
    if (!socket) return;

    socket.on('newMessage', (message) => dispatch(newMessage(message)));
    socket.on('newChannel', (channel) => dispatch(addChannel(channel)));
    socket.on('removeChannel', ({ id }) => dispatch(removeChannel(id)));
    socket.on('renameChannel', (channel) => dispatch(renameChannel(channel)));
    socket.on('disconnect', () => setDisconnected(true));
    socket.on('connect', () => setDisconnected(false));

    return () => socket.removeAllListeners();
  }, [dispatch]);

  useEffect(() => {
    if (!activeChannel && channels.length > 0) {
      const generalChannel = channels.find((c) => c.name === 'general') || channels[0];
      setActiveChannel(generalChannel);
    }
  }, [channels, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket || !messageText.trim() || !activeChannel) return;

    socket.emit(
      'newMessage',
      {
        body: messageText.trim(),
        channelId: activeChannel.id,
        username: user?.username,
      },
      (response) => {
        if (response.status === 'ok') setMessageText('');
      }
    );
  };

  const handleAddChannel = (e) => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket || !newChannelName.trim()) return;

    socket.emit('newChannel', { name: newChannelName.trim() }, (response) => {
      if (response.status === 'ok') {
        setShowModal(false);
        setNewChannelName('');
      }
    });
  };

  if (status !== 'succeeded' || channels.length === 0) {
    return <div>Загрузка чата...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div
        style={{
          width: '250px',
          background: '#f8f9fa',
          borderRight: '1px solid #ddd',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '15px',
            fontWeight: 'bold',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Каналы</span>
          <button
            onClick={() => setShowModal(true)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '18px',
              cursor: 'pointer',
            }}
            aria-label="Добавить канал"
          >
            ＋
          </button>
        </div>

        <ul style={{ listStyle: 'none', padding: '10px', margin: 0, flex: 1 }}>
          {channels.map((channel) => (
            <li key={channel.id} style={{ marginBottom: '5px' }}>
              <button
                type="button"
                onClick={() => setActiveChannel(channel)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px',
                  background:
                    activeChannel?.id === channel.id ? '#495057' : 'transparent',
                  color: activeChannel?.id === channel.id ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        <div style={{ padding: '15px', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
          #{activeChannel?.name}{' '}
          <span style={{ color: '#6c757d', fontWeight: 'normal', marginLeft: '10px' }}>
            {messages.filter((m) => m.channelId === activeChannel?.id).length} сообщений
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
          {messages
            .filter((m) => m.channelId === activeChannel?.id)
            .map((message) => (
              <div key={message.id} style={{ marginBottom: '10px' }}>
                <strong>{message.username}:</strong> {message.body}
              </div>
            ))}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            padding: '10px',
            borderTop: '1px solid #ddd',
            background: '#f8f9fa',
          }}
        >
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Введите сообщение..."
            style={{
              flex: 1,
              marginRight: '10px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '5px',
            }}
            disabled={disconnected}
          />
          <button
            type="submit"
            disabled={disconnected || !activeChannel}
            style={{
              padding: '10px 20px',
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            ➤
          </button>
        </form>
      </div>

      {/* МОДАЛКА */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '400px' }}>
            <h3>Добавить канал</h3>
            <form onSubmit={handleAddChannel}>
              <label htmlFor="newChannel">Имя канала</label>
              <input
                id="newChannel"
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Введите имя канала"
                style={{
                  width: '100%',
                  margin: '10px 0',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    marginRight: '10px',
                    padding: '8px 15px',
                    border: 'none',
                    background: '#6c757d',
                    color: '#fff',
                    borderRadius: '5px',
                  }}
                >
                  Отменить
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 15px',
                    border: 'none',
                    background: '#0d6efd',
                    color: '#fff',
                    borderRadius: '5px',
                  }}
                >
                  Отправить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
