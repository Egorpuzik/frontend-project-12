import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchChatData } from '../store/chatSlice.js'; 

const HomePage = () => {
  const dispatch = useDispatch();
  const { channels, messages, status, error } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchChatData());
  }, [dispatch]);

  return (
    <div>
      <h1>Добро пожаловать в чат!</h1>

      {error && <div style={{ color: 'red' }}>{error}</div>}
      {status === 'loading' && <div>Загрузка...</div>}

      <div style={{ display: 'flex' }}>
        <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
          <h2>Каналы</h2>
          <ul>
            {channels.map((channel) => (
              <li key={channel.id}>{channel.name}</li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1, padding: '10px' }}>
          <h2>Сообщения</h2>
          {messages.length > 0 ? (
            <ul>
              {messages.map((message) => (
                <li key={message.id}>{message.body}</li> 
              ))}
            </ul>
          ) : (
            <p>Сообщений нет</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
