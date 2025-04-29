import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ModalManager from './components/modals/ModalManager.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ModalManager /> {/* ✅ отображаем модалки поверх всего */}
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
