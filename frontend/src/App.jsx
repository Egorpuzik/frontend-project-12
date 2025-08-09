import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext.jsx';
import { initSocket, getSocket } from './utils/socket.js';
import { newMessage, addChannel, removeChannel, renameChannel } from './store/chatSlice.js';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = initSocket();

    if (!socket) {
      console.error('Не удалось инициализировать socket');
      return;
    }

    socket.on('newMessage', (payload) => {
      dispatch(newMessage(payload));
    });

    socket.on('newChannel', (payload) => {
      dispatch(addChannel(payload));
    });

    socket.on('removeChannel', (payload) => {
      dispatch(removeChannel(payload));
    });

    socket.on('renameChannel', (payload) => {
      dispatch(renameChannel(payload));
    });

    return () => {
      socket.off('newMessage');
      socket.off('newChannel');
      socket.off('removeChannel');
      socket.off('renameChannel');
    };
  }, [dispatch]);

  return (
    <AuthProvider>
      <div className="app-wrapper">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
      </div>
    </AuthProvider>
  );
};

export default App;
