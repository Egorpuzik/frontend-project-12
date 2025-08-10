import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { newMessage, addChannel, removeChannel, renameChannel } from '../store/chatSlice.js';
import { getSocket } from '../utils/socket.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './HomePage.css';

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
  const messageInputRef = useRef(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Подписка на события
    const handleNewMessage = (message) => dispatch(newMessage(message));
    const handleNewChannel = (channel) => dispatch(addChannel(channel));
    const handleRemoveChannel = ({ id }) => dispatch(removeChannel(id));
    const handleRenameChannel = (channel) => dispatch(renameChannel(channel));

    const onDisconnect = () => setDisconnected(true);
    const onConnect = () => setDisconnected(false);

    socket.on('newMessage', handleNewMessage);
    socket.on('newChannel', handleNewChannel);
    socket.on('removeChannel', handleRemoveChannel);
    socket.on('renameChannel', handleRenameChannel);
    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    setDisconnected(!socket.connected);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newChannel', handleNewChannel);
      socket.off('removeChannel', handleRemoveChannel);
      socket.off('renameChannel', handleRenameChannel);
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!activeChannel && channels.length > 0) {
      const general = channels.find((c) => c.name === 'general') || channels[0];
      setActiveChannel(general);
    }
  }, [channels, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  useEffect(() => {
    messageInputRef.current?.focus();
  }, [activeChannel]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChannel) return;

    try {
      await axios.post('/api/v1/messages', {
        body: messageText.trim(),
        channelId: activeChannel.id,
        username: user?.username,
      });
      setMessageText('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  const handleAddChannel = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      await axios.post('/api/v1/channels', { name: newChannelName.trim() });
      setShowModal(false);
      setNewChannelName('');
    } catch (error) {
      console.error('Ошибка добавления канала:', error);
    }
  };

  if (status === 'loading') {
    return <div className="loading">Загрузка чата...</div>;
  }

  return (
    <div className="chat-container">
      {/* ЛЕВАЯ ПАНЕЛЬ */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Каналы</span>
          <button onClick={() => setShowModal(true)} className="add-channel-btn" aria-label="Добавить канал">
            +
          </button>
        </div>
        <ul className="channel-list">
          {channels.map((channel) => (
            <li key={channel.id}>
              <button
                type="button"
                aria-label={channel.name}
                onClick={() => setActiveChannel(channel)}
                className={`channel-btn ${activeChannel?.id === channel.id ? 'active' : ''}`}
              >
                <span>#</span> {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ */}
      {activeChannel ? (
        <div className="chat-main">
          <div className="chat-header">
            <span>#{activeChannel.name}</span>
            <span className="message-count">
              {messages.filter((m) => m.channelId === activeChannel.id).length} сообщений
            </span>
          </div>

          <div className="message-list">
            {messages
              .filter((m) => m.channelId === activeChannel.id)
              .map((msg) => (
                <div key={msg.id} className="message">
                  <strong>{msg.username}:</strong> {msg.body}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              ref={messageInputRef}
              type="text"
              aria-label="Новое сообщение"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите сообщение..."
              disabled={disconnected}
            />
            <button type="submit" disabled={disconnected || !activeChannel}>
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ КАНАЛА */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Добавить канал</h3>
            <form onSubmit={handleAddChannel}>
              <label htmlFor="newChannel">Имя канала</label>
              <input
                id="newChannel"
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Введите имя канала"
                autoFocus
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Отменить
                </button>
                <button type="submit" className="btn-submit">
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
