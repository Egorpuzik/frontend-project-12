import { createSlice } from '@reduxjs/toolkit';

const DEFAULT_CHANNEL_ID = 1; 

const channelsSlice = createSlice({
  name: 'channels',
  initialState: {
    channels: [],
    currentChannelId: null,
  },
  reducers: {
    addChannel: (state, action) => {
      state.channels.push(action.payload);
    },
    removeChannel: (state, action) => {
      const { id } = action.payload;
      state.channels = state.channels.filter((channel) => channel.id !== id);

      if (state.currentChannelId === id) {
        state.currentChannelId = DEFAULT_CHANNEL_ID;
      }
    },
    renameChannel: (state, action) => {
      const { id, name } = action.payload;
      const channel = state.channels.find((c) => c.id === id);
      if (channel) {
        channel.name = name;
      }
    },
    setCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload.channels;
      state.currentChannelId = action.payload.currentChannelId;
    },
  },
});

export const {
  addChannel,
  removeChannel,
  renameChannel,
  setCurrentChannelId,
  setChannels,
} = channelsSlice.actions;

export default channelsSlice.reducer;
