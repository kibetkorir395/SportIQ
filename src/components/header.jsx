import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import './header.css';

export default function Header() {
  const navigate = useNavigate();
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
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
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
              <>
                <NavLink 
                  to="/profile" 
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </NavLink>
              </>
            )}

            {/* Mobile Auth Buttons */}
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

        {/* Desktop Auth Buttons */}
        <div className="nav-auth">
          {/* Keep original buttons with display none as requested */}
          <button className="btn-login" style={{ display: "none" }} onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn-signup" style={{ display: "none" }} onClick={() => navigate("/register")}>
            Sign Up
          </button>
          
          {/* Actual auth buttons based on user state */}
          {!user ? (
            <button 
              className="btn-signup desktop-get-started" 
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
