import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { fetchChatData, newMessage, addChannel, removeChannel, renameChannel } from '../store/chatSlice.js';
import { getSocket } from '../utils/socket.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import filter from 'leo-profanity';
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
  const [channelToRename, setChannelToRename] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    formik.resetForm();
    setChannelToRename(null);
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

  const handleOpenRename = (channel) => {
    setChannelToRename(channel);
    formik.setFieldValue('name', channel.name);
    setShowModal(true);
  };

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .transform((v) => (typeof v === 'string' ? v.trim() : ''))
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле')
        .test(
          'unique',
          'Такой канал уже существует',
          (value) => {
            if (!value) return false;
            const existing = channels.map((c) => c.name.toLowerCase());
            if (channelToRename) {
              existing.splice(existing.indexOf(channelToRename.name.toLowerCase()), 1);
            }
            return !existing.includes(value.toLowerCase());
          },
        ),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async ({ name }, { setSubmitting, setErrors, resetForm }) => {
      try {
        if (channelToRename) {
          await axios.patch(`/api/v1/channels/${channelToRename.id}`, { name: name.trim() });
          toast.success('Канал переименован');
        } else {
          await axios.post('/api/v1/channels', { name: name.trim() });
          toast.success('Канал создан');
        }
        closeModal();
        resetForm();
      } catch (err) {
        console.error('Ошибка добавления/переименования канала:', err);
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
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Каналы</span>
          <button
            onClick={() => { setChannelToRename(null); openModal(); }}
            className="btn btn-primary btn-sm"
            aria-label="Добавить канал"
            type="button"
          >
            +
          </button>
        </div>
        <ul className="list-group channel-list">
        {channels.map((channel) => (
    <li
      key={channel.id}
      className="list-group-item p-0 border-0 d-flex justify-content-between align-items-center"
    >
      <button
        type="button"
        aria-label={filter.clean(channel.name)}
        onClick={() => setActiveChannel(channel)}
        className={`w-100 text-start btn btn-light ${
          activeChannel?.id === channel.id ? 'active' : ''
        }`}
      >
        <span>#</span> {filter.clean(channel.name)}
      </button>
      <button
        type="button"
        aria-label="Управление каналом"
        className="btn btn-outline-secondary btn-sm ms-1"
        onClick={() => handleOpenRename(channel)}
      >
        Управление каналом
      </button>
    </li>
  ))}
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
            {messages
              .filter((m) => m.channelId === activeChannel.id)
              .map((msg) => (
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
              className="form-control"
            />
            <button
              type="submit"
              disabled={disconnected}
              className="btn btn-primary"
            >
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{channelToRename ? 'Переименовать канал' : 'Добавить канал'}</h5>
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
                    <label htmlFor="channelName" className="form-label">
                      Имя канала
                    </label>
                    <input
                      id="channelName"
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
                      disabled={formik.isSubmitting}
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
