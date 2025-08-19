import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchChatData, newMessage, addChannel, removeChannel, renameChannel } from '../store/chatSlice.js';
import { getSocket } from '../utils/socket.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import './HomePage.css';

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { channels = [], messages = [], status = 'idle', error } =
    useSelector((state) => state.chat || {});

  const [messageText, setMessageText] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

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

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required('Обязательное поле')
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .notOneOf(channels.map((c) => c.name.toLowerCase()), 'Такой канал уже существует'),
    }),
    onSubmit: async ({ name }, { setSubmitting, resetForm }) => {
      try {
        const response = await axios.post('/api/v1/channels', { name: name.trim() });
        dispatch(addChannel(response.data));
        setActiveChannel(response.data);
        toast.success('Канал создан');
        resetForm();
        closeModal();
      } catch (err) {
        console.error(err);
        toast.error('Ошибка соединения');
      }
      setSubmitting(false);
    },
  });

  if (status === 'loading') return <div className="loading">Загрузка чата...</div>;
  if (error) return <div className="error">Ошибка загрузки: {error}</div>;

  return (
    <div className="chat-container">
      {/* Сайдбар */}
      <div className="sidebar">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span>Каналы</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={openModal}>
            +
          </button>
        </div>
        <ul className="list-group channel-list">
          {channels.map((channel) => (
            <li key={channel.id} className="list-group-item p-0 border-0">
              <button
                type="button"
                className={`w-100 text-start btn btn-light ${
                  activeChannel?.id === channel.id ? 'active' : ''
                }`}
                onClick={() => setActiveChannel(channel)}
              >
                <span>#</span> {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Чат */}
      {activeChannel ? (
        <div className="chat-main">
          <div className="chat-header d-flex justify-content-between">
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

          <form onSubmit={handleSendMessage} className="d-flex mt-2">
            <input
              ref={messageInputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите сообщение..."
              className="form-control me-2"
              disabled={disconnected}
            />
            <button type="submit" className="btn btn-primary" disabled={disconnected || !activeChannel}>
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {/* Модалка Bootstrap 5 + Formik */}
      <div
        className={`modal fade ${showModal ? 'show d-block' : ''}`}
        tabIndex="-1"
        aria-hidden={!showModal}
        onClick={closeModal}
      >
        <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Добавить канал</h5>
              <button type="button" className="btn-close" onClick={closeModal}></button>
            </div>
            <div className="modal-body">
              <form onSubmit={formik.handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="channelName" className="form-label">
                    Имя канала
                  </label>
                  <input
                    id="channelName"
                    name="name"
                    type="text"
                    autoFocus
                    className={`form-control ${
                      formik.touched.name && formik.errors.name ? 'is-invalid' : ''
                    }`}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className="invalid-feedback">{formik.errors.name}</div>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={formik.isSubmitting}>
                    Отменить
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                    Отправить
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
