import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { fetchChatData } from '../store/chatSlice.js';
import { initSocket, disconnectSocket } from '../utils/socket.js'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
      initSocket(); 
      dispatch(fetchChatData());
    }
  }, [dispatch]);

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    initSocket(); 
    dispatch(fetchChatData());
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    delete axios.defaults.headers.common.Authorization;
    disconnectSocket(); 
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
