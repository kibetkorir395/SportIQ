import React from "react";
import { useNavigate } from "react-router-dom";
import Pricing from "./pricing";

function Home() {

  const navigate = useNavigate();

  return (
    <div>
      <section id="home" className="hero">
        <div className="hero-content">
          <h1>Expert Football Predictions</h1>
          <p>
            Advanced match analysis and premium insights for passionate football
            fans
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/predictions")}>Today's Predictions</button>
            <button className="btn-secondary" onClick={() => navigate("/premium")}>Get VIP Now</button>
          </div>
        </div>
      </section>
      <Pricing />
      <section className="features">
        <div className="container">
          <h2>Why Choose Sport IQ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-chart-line" />
              <h3>Data-Driven Analysis</h3>
              <p>
                Advanced algorithms and statistical models power our predictions
              </p>
            </div>
            <div className="feature-card">
              <i className="fas fa-users" />
              <h3>Expert Team</h3>
              <p>Professional analysts with years of football experience</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-bolt" />
              <h3>Live Updates</h3>
              <p>Real-time match insights and in-play analysis</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-shield-alt" />
              <h3>Proven Track Record</h3>
              <p>Consistent performance and transparent results history</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
