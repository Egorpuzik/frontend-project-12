import { createSlice } from '@reduxjs/toolkit';
import filter from 'leo-profanity';

const DEFAULT_CHANNEL_ID = 1;

const channelsSlice = createSlice({
  name: 'channels',
  initialState: {
    channels: [],
    currentChannelId: null,
  },
  reducers: {
    addChannel: (state, action) => {
      const cleanName = filter.clean(action.payload.name);
      state.channels.push({ ...action.payload, name: cleanName });
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
        channel.name = filter.clean(name);
      }
    },
    setCurrentChannelId: (state, action) => {
      state.currentChannelId = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload.channels.map((ch) => ({
        ...ch,
        name: filter.clean(ch.name),
      }));
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
