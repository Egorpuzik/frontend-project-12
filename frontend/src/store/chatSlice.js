import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChatData = createAsyncThunk(
  'chat/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const [channelsRes, messagesRes] = await Promise.all([
        axios.get('/api/v1/channels', config),
        axios.get('/api/v1/messages', config),
      ]);

      return {
        channels: channelsRes.data,
        messages: messagesRes.data,
        currentChannelId: channelsRes.data[0]?.id || null,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Ошибка загрузки');
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

export const { newMessage, setCurrentChannelId } = chatSlice.actions;

export default chatSlice.reducer;
