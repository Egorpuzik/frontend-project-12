import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useSocket } from '../hooks/index.js';
import filterProfanity from '../utils/filterProfanity.js';

const MessageForm = ({ currentChannelId }) => {
  const { t } = useTranslation();
  const socket = useSocket();
  const username = useSelector((state) => state.user.username);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanMessage = filterProfanity(message.trim());

    const messagePayload = {
      body: cleanMessage,
      channelId: currentChannelId,
      username,
    };

    socket.emit('newMessage', messagePayload, () => {
      setMessage('');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 d-flex">
      <input
        type="text"
        className="form-control me-2"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('chat.enterMessage')}
        required
      />
      <button type="submit" className="btn btn-primary">
        {t('chat.send')}
      </button>
    </form>
  );
};

export default MessageForm;
