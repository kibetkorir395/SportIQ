import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import './header.css';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useFirebase();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]); // Fixed: use location.pathname instead of location

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
    
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <NavLink to="/" className="nav-logo" onClick={handleNavClick}>
          <i className="fas fa-futbol" />
          <span>Sport IQ</span>
        </NavLink>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <div className="nav-menu-header">
            <NavLink to="/" className="nav-logo" onClick={handleNavClick}>
              <i className="fas fa-futbol" />
              <span>Sport IQ</span>
            </NavLink>
            <button 
              className="close-menu-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>

          <div className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <i className="fas fa-home"></i>
              <span>Home</span>
            </NavLink>

            <NavLink 
              to="/predictions" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <i className="fas fa-chart-line"></i>
              <span>Predictions</span>
            </NavLink>

            <NavLink 
              to="/premium" 
              className={({ isActive }) => `nav-link premium-btn ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
            >
              <i className="fas fa-crown"></i>
              <span>Pricing</span>
            </NavLink>

            {user && (
              <NavLink 
                to="/profile" 
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </NavLink>
            )}

            {/* Mobile Auth Section */}
            <div className="mobile-auth">
              {!user ? (
                <>
                  <button 
                    className="btn-login" 
                    onClick={() => {
                      navigate("/get-started");
                      handleNavClick();
                    }}
                  >
                    Login
                  </button>
                  <button 
                    className="btn-signup" 
                    onClick={() => {
                      navigate("/get-started");
                      handleNavClick();
                    }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <div className="mobile-user-info">
                  <div className="mobile-user-avatar">
                    {getInitials()}
                  </div>
                  <div className="mobile-user-details">
                    <span className="mobile-user-name">{user.displayName || 'User'}</span>
                    <span className="mobile-user-email">{user.email}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Auth */}
        <div className="nav-auth">
          {/* Hidden buttons (kept for compatibility) */}
          <button className="btn-login" style={{ display: "none" }} onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-signup" style={{ display: "none" }} onClick={() => navigate("/register")}>
            Sign Up
          </button>
          
          {/* Actual desktop auth */}
          {!user ? (
            <button 
              className="desktop-get-started" 
              onClick={() => navigate("/get-started")}
            >
              Get Started
            </button>
          ) : (
            <div className="user-menu">
              <button 
                className="user-avatar"
                onClick={() => navigate("/profile")}
                title="Go to Profile"
              >
                {getInitials()}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
