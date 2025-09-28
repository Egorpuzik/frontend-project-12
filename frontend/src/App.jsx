import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { initSocket } from './utils/socket.js';
import { newMessage, addChannel, removeChannel, renameChannel, fetchChatData } from './store/chatSlice.js';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';

import Header from './components/Header.jsx';
import ModalManager from './components/modals/ModalManager.jsx';

import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import rollbarConfig from './utils/rollbarConfig.js';

const AppContent = () => {
  const dispatch = useDispatch();
  const { user, loading } = useAuth();
  const chatState = useSelector((state) => state.chat);

  useEffect(() => {
    if (!user) return;

    dispatch(fetchChatData());

    const socket = initSocket(user.token);

    socket.on('newMessage', (payload) => dispatch(newMessage(payload)));
    socket.on('newChannel', (payload) => dispatch(addChannel(payload)));
    socket.on('removeChannel', (payload) => dispatch(removeChannel(payload)));
    socket.on('renameChannel', (payload) => dispatch(renameChannel(payload)));

    return () => {
      socket.off('newMessage');
      socket.off('newChannel');
      socket.off('removeChannel');
      socket.off('renameChannel');
    };
  }, [dispatch, user]);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка...</div>;
  }

  if (chatState.status === 'loading') {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка данных чата...</div>;
  }

  if (chatState.status === 'failed') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: 'red' }}>
        Ошибка загрузки данных: {JSON.stringify(chatState.error)}
        <br />
        <a href="/login">Попробовать снова (войти)</a>
      </div>
    );
  }

  return (
    <>
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
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

const App = () => (
  <RollbarProvider config={rollbarConfig}>
    <ErrorBoundary fallbackUI={<div style={{ textAlign: 'center', marginTop: '50px' }}>Произошла ошибка. Перезагрузите страницу.</div>}>
      <AuthProvider>
        <Header />
        <ModalManager />
        <div className="app-wrapper">
          <AppContent />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  </RollbarProvider>
);

export default App;
