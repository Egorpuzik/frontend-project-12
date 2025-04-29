import React, { useEffect, useState, useRef } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatData, newMessage } from '../store/chatSlice.js';
import socket from '../utils/socket.js';

const HomePage = () => {
  const dispatch = useDispatch();
  const { channels, messages, status, error } = useSelector((state) => state.chat);
  const [messageText, setMessageText] = useState('');
  const [disconnected, setDisconnected] = useState(false);
  const messagesEndRef = useRef(null);

  const generalChannel = channels.find((c) => c.name === 'general') || channels[0];

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  useEffect(() => {
    const handleNewMessage = (message) => {
      dispatch(newMessage(message));
    };

    const handleDisconnect = () => {
      console.warn('Соединение с сервером потеряно');
      setDisconnected(true);
    };

    const handleConnect = () => {
      console.log('Соединение восстановлено');
      setDisconnected(false);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect', handleConnect);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect', handleConnect);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Интернет снова появился');
      setDisconnected(false);
    };

    const handleOffline = () => {
      console.warn('Интернет пропал');
      setDisconnected(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !generalChannel) return;

    socket.emit(
      'newMessage',
      {
        body: messageText.trim(),
        channelId: generalChannel.id,
        username: 'Аноним', 
      },
      (response) => {
        if (response.status === 'ok') {
          setMessageText('');
        } else {
          console.error('Ошибка при отправке сообщения');
        }
      }
    );
  };

  return (
    <div>
      <h1>Добро пожаловать в чат!</h1>

      {disconnected && (
        <div style={{ color: 'orange' }}>⚠️ Потеряно соединение с сервером...</div>
      )}

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {status === 'loading' && <div>Загрузка...</div>}

      <div style={{ display: 'flex' }}>
        {/* Список каналов */}
        <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
          <h2>Каналы</h2>
          <ul>
            {channels.map((channel) => (
              <li
                key={channel.id}
                style={{
                  fontWeight: generalChannel?.id === channel.id ? 'bold' : 'normal',
                }}
              >
                {channel.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Чат */}
        <div style={{ flex: 1, padding: '10px' }}>
          <h2>Сообщения</h2>

          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
            {messages
              .filter((m) => m.channelId === generalChannel?.id) 
              .map((message, index) => (
                <div key={message.id || index}>
                  <strong>{message.username}:</strong> {message.body}
                </div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите сообщение..."
              style={{ width: '80%', marginRight: '5px' }}
              disabled={disconnected}
            />
            <button type="submit" disabled={disconnected || !generalChannel}>
              Отправить
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
