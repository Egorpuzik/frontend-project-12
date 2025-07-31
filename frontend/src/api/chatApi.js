const API_URL = '/api/v1/messages';

export const sendMessage = async (message) => {
  try {
    const token = localStorage.getItem('token');
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    throw error;
  }
};
