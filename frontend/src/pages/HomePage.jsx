import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchChatData, newMessage, addChannel, removeChannel, renameChannel } from '../store/chatSlice.js';
import { getSocket } from '../utils/socket.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';
import filter from 'leo-profanity';
import ChannelModal from '../components/ChannelModal.jsx';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { channels = [], messages = [], status = 'idle', error } = useSelector((state) => state.chat || {});

  const [messageText, setMessageText] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [modalProps, setModalProps] = useState({ show: false, type: 'add', channel: null });

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

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
    if (channels.length > 0 && !activeChannel) {
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
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      toast.error('Ошибка соединения');
    }
  };

  const openModal = (type, channel = null) => setModalProps({ show: true, type, channel });
  const closeModal = () => setModalProps({ show: false, type: 'add', channel: null });

  const handleSubmitChannel = async (name, channel) => {
    try {
      if (channel) {
        await axios.patch(`/api/v1/channels/${channel.id}`, { name });
        dispatch(renameChannel({ ...channel, name }));
        toast.success('Канал переименован');
      } else {
        const { data } = await axios.post('/api/v1/channels', { name });
        dispatch(addChannel(data));
        toast.success('Канал создан');
      }
      closeModal();
    } catch (err) {
      console.error('Ошибка добавления/переименования канала:', err);
      throw err;
    }
  };

  const handleDeleteChannel = async (channel) => {
    if (!channel) return;
    try {
      await axios.delete(`/api/v1/channels/${channel.id}`);
      dispatch(removeChannel(channel.id));
      toast.success('Канал удалён');
      setTimeout(() => closeModal(), 200);
      if (activeChannel?.id === channel.id) {
        setActiveChannel(channels.find((c) => c.name === 'general') || channels[0] || null);
      }
    } catch (err) {
      console.error('Ошибка удаления канала:', err);
      toast.error('Ошибка удаления');
    }
  };

  if (status === 'loading') return <div className="loading">Загрузка чата...</div>;
  if (error) return <div className="error">Ошибка загрузки: {error}</div>;

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Каналы</span>
          <button onClick={() => openModal('add')} className="btn btn-primary btn-sm" aria-label="Добавить канал">+</button>
        </div>
        <ul className="list-group channel-list">
          {channels.map((channel) => {
            const canEdit = !['general', 'random'].includes(channel.name);
            return (
              <li key={channel.id} className="list-group-item p-0 border-0 d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  aria-label={filter.clean(channel.name)}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-100 text-start btn btn-light ${activeChannel?.id === channel.id ? 'active' : ''}`}
                >
                  <span>#</span> {filter.clean(channel.name)}
                </button>
                {canEdit && (
                  <button
                    type="button"
                    aria-label="Управление каналом"
                    className="btn btn-outline-secondary btn-sm ms-1"
                    onClick={() => openModal('rename', channel)}
                  >
                    Управление каналом
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {activeChannel ? (
        <div className="chat-main">
          <div className="chat-header">
            <span>#{filter.clean(activeChannel.name)}</span>
            <span className="message-count">
              {messages.filter((m) => m.channelId === activeChannel.id).length} сообщений
            </span>
          </div>

          <div className="message-list">
            {messages.filter((m) => m.channelId === activeChannel.id).map((msg) => (
              <div key={msg.id} className="message">
                <strong>{msg.username}:</strong> {filter.clean(msg.body)}
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
              className="form-control message-input"
            />
            <button type="submit" disabled={disconnected} className="btn btn-primary send-btn">➤</button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {modalProps.show && (
        <ChannelModal
          type={modalProps.type}
          channel={modalProps.channel}
          channels={channels}
          onClose={closeModal}
          onSubmit={handleSubmitChannel}
          onDelete={handleDeleteChannel}
        />
      )}
    </div>
  );
};

export default HomePage;
