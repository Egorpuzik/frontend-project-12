import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './slices/modalSlice.js';
import channelsReducer from './slices/channelsSlice.js';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    channels: channelsReducer,
  },
});

export default store;
