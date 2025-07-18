import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './store/modalsSlice.js';
import channelsReducer from './store/channelsSlice.js';
import chatReducer from './store/chatSlice.js';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    channels: channelsReducer,
    chat: chatReducer, 
  },
});

export default store;
