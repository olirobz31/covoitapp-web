import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Navbar({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span>🚗</span> CovoitApp
      </Link>

      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Accueil
        </Link>
        <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>
          Rechercher
        </Link>

        {user ? (
          <>
            <Link to="/my-trips" className={location.pathname === '/my-trips' ? 'active' : ''}>
              Mes trajets
            </Link>
            <Link to="/create-trip" className={location.pathname === '/create-trip' ? 'active' : ''}>
  ➕         Proposer
            </Link>
            <Link to="/messages" className={location.pathname === '/messages' ? 'active' : ''}>
              💬 Messages
            </Link>
            <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>
              🔔
            </Link>
            <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
              👤 Profil
            </Link>
            <button onClick={handleLogout} className="btn btn-navbar">
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-navbar">
              Connexion
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;