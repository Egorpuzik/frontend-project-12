const API_URL = import.meta.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1/messages`
  : '/api/v1/messages';

export const sendMessage = async (message) => {
  try {
    const savedAuth = JSON.parse(localStorage.getItem('userToken'));
    const token = savedAuth?.token;

    if (!token) {
      throw new Error('Нет токена авторизации, сообщение не отправлено');
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Ошибка при отправке: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    throw error;
  }
};

