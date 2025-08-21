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
  const { channels = [], messages = [], status = 'idle', error } = useSelector((state) => state.chat || {});

  const [messageText, setMessageText] = useState('');
  const [activeChannel, setActiveChannel] = useState(null);
  const [modalInfo, setModalInfo] = useState({ show: false, channel: null });

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const openModal = (channel = null) => setModalInfo({ show: true, channel });
  const closeModal = () => setModalInfo({ show: false, channel: null });

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('newMessage', (msg) => dispatch(newMessage(msg)));
    socket.on('newChannel', (ch) => dispatch(addChannel(ch)));
    socket.on('removeChannel', ({ id }) => dispatch(removeChannel(id)));
    socket.on('renameChannel', (ch) => dispatch(renameChannel(ch)));

    return () => {
      socket.off('newMessage');
      socket.off('newChannel');
      socket.off('removeChannel');
      socket.off('renameChannel');
    };
  }, [dispatch]);

  useEffect(() => {
    if (channels.length && !activeChannel) {
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
    } catch {
      toast.error('Ошибка соединения');
    }
  };

  const handleDeleteChannel = async () => {
    if (!modalInfo.channel) return;
    try {
      await axios.delete(`/api/v1/channels/${modalInfo.channel.id}`);
      dispatch(removeChannel(modalInfo.channel.id));
      closeModal();
      toast.success('Канал удалён');
    } catch {
      toast.error('Ошибка удаления');
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
        .test('unique', 'Такой канал уже существует', (value) => {
          if (!value) return false;
          const existing = channels.map((c) => c.name.toLowerCase());
          if (modalInfo.channel) {
            existing.splice(existing.indexOf(modalInfo.channel.name.toLowerCase()), 1);
          }
          return !existing.includes(value.toLowerCase());
        }),
    }),
    onSubmit: async ({ name }, { setSubmitting, setErrors, resetForm }) => {
      try {
        if (modalInfo.channel) {
          await axios.patch(`/api/v1/channels/${modalInfo.channel.id}`, { name });
          toast.success('Канал переименован');
        } else {
          await axios.post('/api/v1/channels', { name });
          toast.success('Канал создан');
        }
        closeModal();
        resetForm();
      } catch {
        setErrors({ name: 'Ошибка соединения' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (status === 'loading') return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Каналы</span>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal(null)}>
            +
          </button>
        </div>
        <ul className="list-group channel-list">
          {channels.map((channel) => (
            <li key={channel.id} className="list-group-item d-flex justify-content-between align-items-center p-0">
              <button
                type="button"
                className={`btn w-100 text-start ${activeChannel?.id === channel.id ? 'active' : ''}`}
                onClick={() => setActiveChannel(channel)}
              >
                # {filter.clean(channel.name)}
              </button>
              {!['general', 'random'].includes(channel.name) && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm ms-1"
                  onClick={() => {
                    formik.setFieldValue('name', channel.name);
                    openModal(channel);
                  }}
                >
                  Управление каналом
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {activeChannel && (
        <div className="chat-main">
          <div className="chat-header">
            <span>#{filter.clean(activeChannel.name)}</span>
            <span>{messages.filter((m) => m.channelId === activeChannel.id).length} сообщений</span>
          </div>
          <div className="message-list">
            {messages
              .filter((m) => m.channelId === activeChannel.id)
              .map((msg) => (
                <div key={msg.id}>
                  <strong>{msg.username}:</strong> {filter.clean(msg.body)}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="message-form">
            <input
              ref={messageInputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите сообщение..."
              className="form-control"
            />
            <button type="submit" className="btn btn-primary">
              ➤
            </button>
          </form>
        </div>
      )}

      {modalInfo.show && (
        <div className="modal show d-block" onClick={closeModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{modalInfo.channel ? 'Переименовать канал' : 'Добавить канал'}</h5>
                <button type="button" className="btn-close" onClick={closeModal} />
              </div>
              <div className="modal-body">
                <form onSubmit={formik.handleSubmit}>
                  <input
                    id="channelName"
                    name="name"
                    type="text"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    autoFocus
                    className={`form-control ${formik.errors.name ? 'is-invalid' : ''}`}
                  />
                  {formik.errors.name && <div className="invalid-feedback">{formik.errors.name}</div>}
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Отменить
                    </button>
                    {modalInfo.channel && (
                      <button type="button" className="btn btn-danger" onClick={handleDeleteChannel}>
                        Удалить
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={formik.isSubmitting}>
                      Сохранить
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
