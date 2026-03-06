import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>Incident System</h2>
        </div>

        <div className="navbar-menu">
          <button
            className="nav-link"
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </button>

          {user.role === 'admin' && (
            <>
              <button
                className="nav-link"
                onClick={() => navigate('/admin')}
              >
                Admin
              </button>
              <button
                className="nav-link"
                onClick={() => navigate('/users')}
              >
                Users
              </button>
            </>
          )}
        </div>

        <div className="navbar-user">
          <span className="user-name">{user.username}</span>
          <span className="user-role">{user.role}</span>
          <button
            className="btn-logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
