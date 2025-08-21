import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {fetchChatData, newMessage, addChannel, removeChannel, renameChannel} from '../store/chatSlice.js';
import { getSocket } from '../utils/socket.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import filter from 'leo-profanity';
import './HomePage.css';

const DEFAULT_CHANNELS = ['general', 'random'];

const isDefaultChannel = (c) =>
  c && DEFAULT_CHANNELS.includes(String(c.name || '').toLowerCase());

const ChannelModal = ({
  isOpen,
  mode, 
  channel, 
  channels,
  onClose,
  onCreate, 
  onRename, 
  onRemove, 
}) => {
  const initialName = mode === 'rename' ? channel?.name || '' : '';

  const validationSchema = useMemo(
    () =>
      Yup.object({
        name:
          mode === 'remove'
            ? Yup.mixed().notRequired()
            : Yup.string()
                .transform((v) => (typeof v === 'string' ? v.trim() : ''))
                .min(3, 'От 3 до 20 символов')
                .max(20, 'От 3 до 20 символов')
                .required('Обязательное поле')
                .test('unique', 'Такой канал уже существует', (value) => {
                  if (!value) return false;
                  const current = value.toLowerCase();
                  const existing = channels
                    .map((c) => c.name.toLowerCase())
                    .filter((n) =>
                      mode === 'rename'
                        ? n !== String(channel?.name || '').toLowerCase()
                        : true
                    );
                  return !existing.includes(current);
                }),
      }),
    [channels, channel, mode]
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { name: initialName },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async ({ name }, { setSubmitting, setErrors, resetForm }) => {
      try {
        const trimmed = (name || '').trim();
        if (mode === 'create') {
          await onCreate(trimmed);
          toast.success('Канал создан');
        }
        if (mode === 'rename' && channel) {
          await onRename(channel.id, trimmed);
          toast.success('Канал переименован');
        }
        resetForm();
        onClose();
      } catch (e) {
        setErrors({ name: 'Ошибка соединения' });
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {mode === 'create' && 'Добавить канал'}
              {mode === 'rename' && 'Переименовать канал'}
              {mode === 'remove' && 'Удалить канал'}
            </h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Закрыть"
              onClick={onClose}
            />
          </div>

          <div className="modal-body">
            {mode === 'remove' ? (
              <p className="mb-0">
                Вы уверены, что хотите удалить канал{' '}
                <strong>#{filter.clean(channel?.name || '')}</strong>?
              </p>
            ) : (
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
                      formik.errors.name &&
                      (formik.touched.name || formik.submitCount > 0)
                        ? 'is-invalid'
                        : ''
                    }`}
                  />
                  {formik.errors.name &&
                    (formik.touched.name || formik.submitCount > 0) && (
                      <div className="invalid-feedback d-block">
                        {formik.errors.name}
                      </div>
                    )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                  >
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
            )}
          </div>

          {mode === 'remove' && (
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Отменить
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await onRemove(channel.id);
                    toast.success('Канал удалён');
                    onClose();
                  } catch {
                    toast.error('Ошибка удаления');
                  }
                }}
              >
                Удалить
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { channels = [], messages = [], status = 'idle', error } =
    useSelector((state) => state.chat || {});

  const [messageText, setMessageText] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [modalChannel, setModalChannel] = useState(null);

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
    const handleRemoveChannelEvt = ({ id }) => dispatch(removeChannel(id));
    const handleRenameChannelEvt = (channel) => dispatch(renameChannel(channel));
    const onDisconnect = () => setDisconnected(true);
    const onConnect = () => setDisconnected(false);

    socket.on('newMessage', handleNewMessage);
    socket.on('newChannel', handleNewChannel);
    socket.on('removeChannel', handleRemoveChannelEvt);
    socket.on('renameChannel', handleRenameChannelEvt);
    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    setDisconnected(!socket.connected);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('newChannel', handleNewChannel);
      socket.off('removeChannel', handleRemoveChannelEvt);
      socket.off('renameChannel', handleRenameChannelEvt);
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [dispatch]);

  useEffect(() => {
    if (channels.length === 0) return;

    if (!activeChannel) {
      const general =
        channels.find((c) => c.name === 'general') || channels[0];
      setActiveChannel(general);
      return;
    }
    const stillExists = channels.find((c) => c.id === activeChannel.id);
    if (!stillExists) {
      const general =
        channels.find((c) => c.name === 'general') || channels[0];
      setActiveChannel(general);
    }
  }, [channels, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  useEffect(() => {
    messageInputRef.current?.focus();
  }, [activeChannel]);

  const emitOrHttp = async (event, payload, http) => {
    const socket = getSocket();

    if (socket) {
      try {
        await new Promise((resolve, reject) => {
          socket.emit(event, payload, (response) => {
            if (response?.status === 'ok') resolve();
            else reject(new Error('ack error'));
          });
        });
        return;
      } catch {

      }
    }

    await http();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChannel) return;

    const payload = {
      body: messageText.trim(),
      channelId: activeChannel.id,
      username: user?.username,
    };

    try {
      await emitOrHttp('newMessage', payload, () =>
        axios.post('/api/v1/messages', payload)
      );
      setMessageText('');
      messageInputRef.current?.focus();
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      toast.error('Ошибка соединения');
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setModalChannel(null);
    setModalOpen(true);
  };

  const openRenameModal = (channel) => {
    setModalMode('rename');
    setModalChannel(channel);
    setModalOpen(true);
  };

  const openRemoveModal = (channel) => {
    setModalMode('remove');
    setModalChannel(channel);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalChannel(null);
  };

  const createChannel = async (name) => {
    const payload = { name };
    await emitOrHttp('newChannel', payload, () =>
      axios.post('/api/v1/channels', payload)
    );
  };

  const renameChannelAction = async (id, name) => {
    const payload = { id, name };
    await emitOrHttp('renameChannel', payload, () =>
      axios.patch(`/api/v1/channels/${id}`, { name })
    );
  };

  const removeChannelAction = async (id) => {
    const payload = { id };
    await emitOrHttp('removeChannel', payload, () =>
      axios.delete(`/api/v1/channels/${id}`)
    );
  };

  if (status === 'loading') return <div className="loading">Загрузка чата...</div>;
  if (error) return <div className="error">Ошибка загрузки: {error}</div>;

  return (
    <div className="chat-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <span>Каналы</span>
          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-sm"
            aria-label="Добавить канал"
            type="button"
          >
            +
          </button>
        </div>

        <ul className="list-group channel-list">
          {channels.map((channel) => {
            const active = activeChannel?.id === channel.id;
            const locked = isDefaultChannel(channel); 

            return (
              <li
                key={channel.id}
                className="list-group-item p-0 border-0 d-flex justify-content-between align-items-center"
              >
                <button
                  type="button"
                  aria-label={filter.clean(channel.name)}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-100 text-start btn btn-light ${active ? 'active' : ''}`}
                >
                  <span>#</span> {filter.clean(channel.name)}
                </button>

                {!locked && (
                  <div className="ms-1 d-flex gap-1">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      aria-label="Переименовать канал"
                      onClick={() => openRenameModal(channel)}
                    >
                      Переименовать
                    </button>
                    {/* этот текст ищут тесты: 'text=Удалить' */}
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      aria-label="Удалить канал"
                      onClick={() => openRemoveModal(channel)}
                    >
                      Удалить
                    </button>
                  </div>
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
              placeholder={disconnected ? 'Нет соединения…' : 'Введите сообщение...'}
              disabled={disconnected}
              className="form-control"
            />
            <button type="submit" disabled={disconnected} className="btn btn-primary">
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {/* ЕДИНАЯ МОДАЛКА */}
      <ChannelModal
        isOpen={modalOpen}
        mode={modalMode}
        channel={modalChannel}
        channels={channels}
        onClose={closeModal}
        onCreate={createChannel}
        onRename={renameChannelAction}
        onRemove={removeChannelAction}
      />
    </div>
  );
};

export default HomePage;
