import React from 'react'
import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
        <div className="container">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>Sport IQ</h4>
                    <p>Your trusted source for premium football predictions and analysis.</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <NavLink to="/">Home</NavLink>
                    <NavLink to="predictions">Predictions</NavLink>
                    <NavLink to="premium">Premium</NavLink>
                </div>
                <div className="footer-section" style={{display: "none"}}>
                    <h4>Admin</h4>
                    <NavLink to="#">Add Tip</NavLink>
                    <NavLink to="#">All Users</NavLink>
                </div>
            </div>
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} Sport IQ. All rights reserved.</p>
            </div>
        </div>
    </footer>
  )
}
