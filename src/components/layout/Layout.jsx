// Shared Layout Component with Navigation
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children, title, showBack = false, backPath = '/dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, adminData, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/products', label: 'Products' },
    { path: '/categories', label: 'Categories' },
    { path: '/iap-products', label: 'IAP Products' },
    { path: '/purchases', label: 'Purchases' },
    { path: '/users', label: 'Users' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="admin-layout">
      {/* Top Navigation Bar */}
      <header className="admin-header">
        <div className="header-left">
          <div className="app-icon">
            <img src="/app_icon.png" alt="AssetDoor Logo" />
          </div>
        </div>

        <nav className="header-nav">
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="header-right">
          <div className="user-menu-container" ref={userMenuRef}>
            <button
              className="user-icon-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title="User menu"
            >
              <div className="user-icon">
                {adminData?.photoURL ? (
                  <img src={adminData.photoURL} alt="User" />
                ) : (
                  <span>{adminData?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}</span>
                )}
              </div>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar">
                    {adminData?.photoURL ? (
                      <img src={adminData.photoURL} alt="User" />
                    ) : (
                      <span>{adminData?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}</span>
                    )}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{adminData?.displayName || 'Admin'}</div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="admin-main">
        {title && (
          <div className="page-header-content">
            {showBack && location.pathname !== '/dashboard' && (
              <button
                className="back-button"
                onClick={() => navigate(backPath)}
                title="Go back"
              >
                ← Back
              </button>
            )}
            <h1 className="page-title">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;

