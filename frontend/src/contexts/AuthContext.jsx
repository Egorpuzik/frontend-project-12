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
    const savedAuth = JSON.parse(localStorage.getItem('userToken'));
    if (savedAuth?.token && savedAuth?.username) {
      setToken(savedAuth.token);
      setUser({ username: savedAuth.username });
      axios.defaults.headers.common.Authorization = `Bearer ${savedAuth.token}`;
      initSocket();
      dispatch(fetchChatData());
    }
  }, [dispatch]);

  const login = (data, usernameFromForm) => {
    const { token: newToken } = data;
    const username = data.username || usernameFromForm;

    if (!newToken || !username) {
      console.error('Missing token or username in login data');
      return;
    }

    const userData = { token: newToken, username };
    localStorage.setItem('userToken', JSON.stringify(userData));

    setToken(newToken);
    setUser({ username });

    axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    initSocket();
    dispatch(fetchChatData());
  };

  const logout = () => {
    localStorage.removeItem('userToken');
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
