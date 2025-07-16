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
    <header className="navbar navbar-light bg-light mb-4">
      <div className="container">
        <Link to="/" className="navbar-brand">Hexlet Chat</Link>
        {auth.isAuthenticated && (
          <button type="button" className="btn btn-primary" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
