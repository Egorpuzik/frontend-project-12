import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  channels: [],
  currentChannelId: null,
};

const channelsSlice = createSlice({
  name: 'channels',
  initialState,
  reducers: {
    setChannels(state, action) {
      state.channels = action.payload;
    },
    setCurrentChannelId(state, action) {
      state.currentChannelId = action.payload;
    },
    addChannel(state, action) {
      state.channels.push(action.payload);
    },
    removeChannel(state, action) {
      state.channels = state.channels.filter((c) => c.id !== action.payload);
    },
    renameChannel(state, action) {
      const channel = state.channels.find((c) => c.id === action.payload.id);
      if (channel) {
        channel.name = action.payload.name;
      }
    },
  },
});

export const {
  setChannels,
  setCurrentChannelId,
  addChannel,
  removeChannel,
  renameChannel,
} = channelsSlice.actions;

export default channelsSlice.reducer;
