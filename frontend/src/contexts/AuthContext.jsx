import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { fetchChatData } from '../store/chatSlice.js';
import { initSocket, disconnectSocket } from '../utils/socket.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
      initSocket();
      dispatch(fetchChatData());
    }
  }, [dispatch]);

  const login = async (data) => {
    const { token: newToken, username } = data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify({ username }));

    setToken(newToken);
    setUser({ username });

    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    initSocket();

    await dispatch(fetchChatData());
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common.Authorization;
    disconnectSocket();
  };

  const isAuthenticated = Boolean(token);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
