import { configureStore } from '@reduxjs/toolkit';
import modalReducer from './store/modalsSlice.js';
import channelsReducer from './store/channelsSlice.js';

const store = configureStore({
  reducer: {
    modal: modalReducer,
    channels: channelsReducer,
  },
});

export default store;
