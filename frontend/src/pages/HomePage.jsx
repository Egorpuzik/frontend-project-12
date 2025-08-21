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

const NON_MANAGED_CHANNELS = ['general', 'random'];

const HomePage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { channels = [], messages = [], status = 'idle', error } = useSelector((state) => state.chat || {});

  const [messageText, setMessageText] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const [activeChannel, setActiveChannel] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalReady, setModalReady] = useState(false);

  const [modalMode, setModalMode] = useState('add');
  const [channelToEdit, setChannelToEdit] = useState(null);

  const [openActionFor, setOpenActionFor] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) {
      setDisconnected(true);
      return undefined;
    }

    const handleNewMessage = (message) => dispatch(newMessage(message));
    const handleNewChannel = (channel) => dispatch(addChannel(channel));
    const handleRemoveChannel = ({ id }) => dispatch(removeChannelAction(id));
    const handleRenameChannel = (channel) => dispatch(renameChannelAction(channel));
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
    } else if (activeChannel) {
      const found = channels.find((c) => c.id === activeChannel.id);
      if (!found) {
        setActiveChannel(channels[0] || null);
      } else if (found.name !== activeChannel.name) {
        setActiveChannel(found);
      }
    }
  }, [channels, activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel]);

  useEffect(() => {
    messageInputRef.current?.focus();
  }, [activeChannel]);

  const openModal = (mode = 'add', channel = null) => {
    setModalMode(mode);
    setChannelToEdit(channel);
    setShowModal(true);
    setModalReady(false);
    setTimeout(() => setModalReady(true), 0);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalReady(false);
    setChannelToEdit(null);
    setModalMode('add');
    formik.resetForm();
  };

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

  const handleOpenActionMenu = (channelId) => {
    setOpenActionFor((prev) => (prev === channelId ? null : channelId));
  };

  const handleRequestRename = (channel) => {
    setOpenActionFor(null);
    openModal('rename', channel);
    formik.setFieldValue('name', channel.name);
  };

  const handleRequestDelete = (channel) => {
    setOpenActionFor(null);
    openModal('remove', channel);
  };

  const handleDeleteChannel = async () => {
    if (!channelToEdit) return;
    try {
      await axios.delete(`/api/v1/channels/${channelToEdit.id}`);
      dispatch(removeChannelAction(channelToEdit.id));
      toast.success('Канал удалён');
      if (activeChannel?.id === channelToEdit.id) {
        setActiveChannel(channels.find((c) => c.id !== channelToEdit.id) || null);
      }
      closeModal();
    } catch (err) {
      console.error('Ошибка удаления канала:', err);
      toast.error('Ошибка удаления');
    }
  };

  const handleRenameChannelSubmit = async (name) => {
    if (!channelToEdit) return;
    try {
      await axios.patch(`/api/v1/channels/${channelToEdit.id}`, { name: name.trim() });
      toast.success('Канал переименован');
      closeModal();
      dispatch(renameChannelAction({ id: channelToEdit.id, name: name.trim() }));
    } catch (err) {
      console.error('Ошибка переименования канала:', err);
      toast.error('Ошибка соединения');
    }
  };

  const handleCreateChannelSubmit = async (name) => {
    try {
      await axios.post('/api/v1/channels', { name: name.trim() });
      toast.success('Канал создан');
      closeModal();
    } catch (err) {
      console.error('Ошибка добавления канала:', err);
      toast.error('Ошибка соединения');
    }
  };

  const formik = useFormik({
    initialValues: { name: '' },
    validationSchema: Yup.object({
      name: Yup.string()
        .transform((v) => (typeof v === 'string' ? v.trim() : ''))
        .min(3, 'От 3 до 20 символов')
        .max(20, 'От 3 до 20 символов')
        .required('Обязательное поле')
        .test('unique', 'Такой канал уже существует', (value) => {
          if (!value) return false;
          const existing = channels.map((c) => c.name.toLowerCase());
          if (channelToEdit) {
            const idx = existing.indexOf(channelToEdit.name.toLowerCase());
            if (idx !== -1) existing.splice(idx, 1);
          }
          return !existing.includes(value.toLowerCase());
        }),
    }),
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async ({ name }, { setSubmitting, setErrors, resetForm }) => {
      try {
        if (modalMode === 'rename') {
          await handleRenameChannelSubmit(name);
        } else {
          await handleCreateChannelSubmit(name);
        }
        resetForm();
      } catch (err) {
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
        <div className="sidebar-header d-flex justify-content-between align-items-center">
          <span>Каналы</span>
          <button
            onClick={() => { setChannelToEdit(null); openModal('add', null); formik.setFieldValue('name', ''); }}
            className="btn btn-primary btn-sm"
            aria-label="Добавить канал"
            type="button"
          >
            +
          </button>
        </div>

        <ul className="list-group channel-list">
          {channels.map((channel) => {
            const isActive = activeChannel?.id === channel.id;
            const isManaged = !NON_MANAGED_CHANNELS.includes(channel.name);
            return (
              <li
                key={channel.id}
                className="list-group-item p-0 border-0 d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center w-100">
                  <button
                    type="button"
                    aria-label={filter.clean(channel.name)}
                    onClick={() => setActiveChannel(channel)}
                    className={`w-100 text-start btn btn-light text-truncate ${isActive ? 'active' : ''}`}
                    style={{ textAlign: 'left' }}
                  >
                    <span>#</span> {filter.clean(channel.name)}
                  </button>

                  <div className="ms-1">
                    {isManaged ? (
                      <div className="btn-group">
                        <button
                          type="button"
                          aria-label={`Управление каналом ${channel.name}`}
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => handleOpenActionMenu(channel.id)}
                        >
                          ⋮
                        </button>

                        {/* Simple menu rendered conditionally */}
                        {openActionFor === channel.id && (
                          <div className="action-menu dropdown-menu show" style={{ position: 'absolute' }}>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => handleRequestRename(channel)}
                            >
                              Переименовать
                            </button>
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => handleRequestDelete(channel)}
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted small ms-2">—</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {activeChannel ? (
        <div className="chat-main">
          <div className="chat-header d-flex justify-content-between align-items-center">
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

          <form onSubmit={handleSendMessage} className="message-form d-flex gap-2">
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
            <button type="submit" disabled={disconnected} className="btn btn-primary">
              ➤
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">Выберите канал</div>
      )}

      {/* Unified modal */}
      {showModal && modalReady && (
        <div
          key={channelToEdit?.id || modalMode + '-new'}
          className="modal show d-block"
          tabIndex="-1"
          onClick={closeModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              {/* Modal header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalMode === 'add' && 'Добавить канал'}
                  {modalMode === 'rename' && 'Переименовать канал'}
                  {modalMode === 'remove' && 'Удалить канал'}
                </h5>
                <button type="button" className="btn-close" aria-label="Закрыть" onClick={closeModal} />
              </div>

              {/* Modal body */}
              <div className="modal-body">
                {modalMode === 'remove' ? (
                  <>
                    <p>Вы действительно хотите удалить канал &laquo;{channelToEdit?.name}&raquo;?</p>
                  </>
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
                          formik.errors.name && (formik.touched.name || formik.submitCount > 0) ? 'is-invalid' : ''
                        }`}
                      />
                      {formik.errors.name && (formik.touched.name || formik.submitCount > 0) && (
                        <div className="invalid-feedback d-block">{formik.errors.name}</div>
                      )}
                    </div>
                  </form>
                )}
              </div>

              {/* Modal footer */}
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Отменить
                </button>

                {modalMode === 'remove' ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleDeleteChannel}
                  >
                    Удалить
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      formik.handleSubmit();
                    }}
                    disabled={formik.isSubmitting}
                  >
                    Отправить
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;