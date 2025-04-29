import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,       
  type: null,          
  channelId: null,     
};

const modalsSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    openModal: (state, action) => {
      const { type, channelId = null } = action.payload;
      state.isOpen = true;
      state.type = type;
      state.channelId = channelId;
    },
    closeModal: (state) => {
      state.isOpen = false;
      state.type = null;
      state.channelId = null;
    },
  },
});

export const { openModal, closeModal } = modalsSlice.actions;

export default modalsSlice.reducer;
