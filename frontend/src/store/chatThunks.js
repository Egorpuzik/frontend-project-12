import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChatData = createAsyncThunk(
  'chat/fetchData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/v1/data'); 
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);
