import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Header = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <header
      className="bg-white border-bottom py-3"
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000 }}
    >
      <div className="container d-flex justify-content-between align-items-center">
        <Link
          to="/"
          className="text-dark text-decoration-none fs-5 fw-normal"
          style={{ userSelect: 'none' }}
        >
          Hexlet Chat
        </Link>
        {auth.isAuthenticated && (
          <button type="button" className="btn btn-outline-primary" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
