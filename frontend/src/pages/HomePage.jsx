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
  const messageInputRef = useRef(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    formik.resetForm();
  };

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
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле')
        .notOneOf(channels.map((c) => c.name.toLowerCase()), 'Такой канал уже существует'),
    }),
    onSubmit: async ({ name }, { setSubmitting, setErrors, resetForm }) => {
      try {
        await axios.post('/api/v1/channels', { name: name.trim() });
        closeModal();
        resetForm();
        toast.success('Канал создан');
      } catch (err) {
        console.error('Ошибка добавления канала:', err);
        setErrors({ name: 'Ошибка соединения' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (status === 'loading') return <div className="loading">Загрузка чата...</div>;
  if (error) return <div className="error">Ошибка загрузки: {error}</div>;

  return (
    <div className="chat-container">
      {/* Сайдбар с каналами */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Каналы</span>
          <button
            onClick={openModal}
            className="btn btn-primary btn-sm"
            aria-label="Добавить канал"
            type="button"
          >
            +
          </button>
        </div>
        <ul className="list-group channel-list">
          {channels.map((channel) => (
            <li key={channel.id} className="list-group-item p-0 border-0">
              <button
                type="button"
                aria-label={channel.name}
                onClick={() => setActiveChannel(channel)}
                className={`w-100 text-start btn btn-light ${
                  activeChannel?.id === channel.id ? 'active' : ''
                }`}
              >
                <span>#</span> {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Основное окно чата */}
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
              className="form-control"
            />
            <button
              type="submit"
              disabled={disconnected || !activeChannel}
              className="btn btn-primary"
            >
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {/* Модалка добавления канала */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Добавить канал</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Закрыть"
                  onClick={closeModal}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={formik.handleSubmit} noValidate>
                  <div className="mb-3">
                    <label htmlFor="newChannel" className="form-label">
                      Имя канала
                    </label>
                    <input
                      id="newChannel"
                      name="name"
                      type="text"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Введите имя канала"
                      autoFocus
                      className={`form-control ${
                        formik.errors.name && (formik.touched.name || formik.submitCount > 0)
                          ? 'is-invalid'
                          : ''
                      }`}
                    />
                    {formik.errors.name && (formik.touched.name || formik.submitCount > 0) && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.name}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="btn btn-secondary">
                      Отменить
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
                    >
                      Отправить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
