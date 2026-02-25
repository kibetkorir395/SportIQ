import React from 'react';
import './error-page.css';
import { NavLink } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div className="error-container">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h1>404 - Page Not Found</h1>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>

        <div className="error-actions">
          <NavLink to="/" className="btn-primary">Go Home</NavLink>
          <NavLink to="/predictions" className="btn-secondary">Browse Tips</NavLink>
          <NavLink to="/get-started" className="btn-secondary">Get Started</NavLink>
        </div>

        <div className="error-suggestions">
          <h3>Popular Pages</h3>
          <div className="suggestion-links">
            <NavLink to="/">Homepage</NavLink>
            <NavLink to="/predictions">VIP Predictions</NavLink>
            <NavLink to="/premium">Subscription Plans</NavLink>
            <NavLink to="/get-started">Get Started</NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}