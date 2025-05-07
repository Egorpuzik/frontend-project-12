import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ModalManager from './components/modals/ModalManager.jsx';
import Header from './components/Header.jsx';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Provider as RollbarProvider, ErrorBoundary } from '@rollbar/react';
import rollbarConfig from './utils/rollbarConfig.js';

function App() {
  return (
    <RollbarProvider config={rollbarConfig}>
      <ErrorBoundary>
        <AuthProvider>
          <BrowserRouter>
            <Header />
            <ModalManager />
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

            {/* ✅ Контейнер для отображения уведомлений */}
            <ToastContainer position="top-right" autoClose={5000} />
          </BrowserRouter>
        </AuthProvider>
      </ErrorBoundary>
    </RollbarProvider>
  );
}

export default App;
