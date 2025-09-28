import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const fetchChatData = createAsyncThunk(
  'chat/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const savedAuth = JSON.parse(localStorage.getItem('userToken'));
      const token = savedAuth?.token;

      if (!token) {
        console.warn('⚠️ fetchChatData: отсутствует токен авторизации');
        window.location.href = '/login'; 
        return rejectWithValue('Нет токена авторизации');
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [channelsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/v1/channels`, config),
        axios.get(`${API_BASE_URL}/api/v1/messages`, config),
      ]);

      return {
        channels: channelsRes.data || [],
        messages: messagesRes.data || [],
        currentChannelId:
          (channelsRes.data && channelsRes.data[0]?.id) || null,
      };
    } catch (error) {
      const status = error.response?.status;
      console.error('❌ Ошибка fetchChatData:', status, error.response?.data || error.message);

      if (status === 401) {
        localStorage.removeItem('userToken');
        window.location.href = '/login';
      }

      return rejectWithValue(error.response?.data || 'Ошибка загрузки данных');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    channels: [],
    messages: [],
    currentChannelId: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    newMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload;
    },
    addChannel: (state, action) => {
      state.channels.push(action.payload);
    },
    removeChannel: (state, action) => {
      const id = action.payload;
      state.channels = state.channels.filter((ch) => ch.id !== id);
      state.messages = state.messages.filter((msg) => msg.channelId !== id);

      if (state.currentChannelId === id) {
        state.currentChannelId = state.channels[0]?.id || null;
      }
    },
    renameChannel: (state, action) => {
      const { id, name } = action.payload;
      const channel = state.channels.find((ch) => ch.id === id);
      if (channel) channel.name = name;
    },
    resetChat: (state) => {
      state.channels = [];
      state.messages = [];
      state.currentChannelId = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchChatData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.channels = action.payload.channels;
        state.messages = action.payload.messages;
        state.currentChannelId = action.payload.currentChannelId;
      })
      .addCase(fetchChatData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  newMessage,
  setCurrentChannelId,
  addChannel,
  removeChannel,
  renameChannel,
  resetChat,
} = chatSlice.actions;

export default chatSlice.reducer;
