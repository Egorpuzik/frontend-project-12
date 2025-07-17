import { configureStore } from '@reduxjs/toolkit';
import channelsReducer from './channelsSlice.js';
import modalsReducer from './modalsSlice.js';
import chatReducer from './chatSlice.js'; 

export const store = configureStore({
  reducer: {
    channels: channelsReducer,
    modals: modalsReducer,
    chat: chatReducer, 
  },
});
