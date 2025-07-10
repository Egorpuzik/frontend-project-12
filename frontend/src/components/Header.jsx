import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Header = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  console.log('Header loaded, loggedIn:', auth.loggedIn); 

  const handleLogout = () => {
    auth.logOut(); 
    navigate('/login');
  };

  return (
    <header className="app-header">
      <Link to="/">Hexlet Chat</Link>
      {auth.loggedIn && (
        <button type="button" onClick={handleLogout}>
          Выйти
        </button>
      )}
    </header>
  );
};


export default Header;

