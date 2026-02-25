import React, { useState } from "react";
import { pricings } from "../data";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import Joyride from 'react-joyride';

function Pricing({ showModal }) {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [runTour, setRunTour] = useState(true);

  const steps = [
    {
      target: '.pricing-header',
      content: 'Choose the plan that fits your needs',
      title: 'Subscription Plans',
      placement: 'bottom',
    },
    {
      target: '.features-list',
      content: 'Each plan comes with specific features',
      title: 'Plan Features',
      placement: 'top',
    },
    {
      target: '.btn-subscribe',
      content: 'Click here to subscribe and start winning!',
      title: 'Subscribe Now',
      placement: 'top',
    }
  ];

  const handleSubscribe = (pricing) => {
    if (!user) {
      showModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login or create an account to subscribe',
        confirmText: 'Login Now',
        onConfirm: () => navigate('/get-started')
      });
      return;
    }

    // Navigate to payment page with selected package
    navigate('/payment', { 
      state: { 
        pricing: pricing,
        from: 'pricing' 
      } 
    });
  };

  return (
    <section id="premium" className="premium-section">
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: { primaryColor: '#22c55e' }
        }}
      />

      <div className="container">
        <h2>Premium Tips Subscription</h2>
        <p className="section-subtitle">
          Get access to our most accurate predictions and in-depth analysis
        </p>

        <div className="pricing-cards">
          {pricings.map((pricing, index) => {
            return (
              <div
                className={`pricing-card ${pricing.isPopular && "popular"}`}
                key={index}
              >
                {pricing.isPopular && (
                  <div className="popular-badge">MOST POPULAR</div>
                )}
                <div className="pricing-header">
                  <h3>{(pricing.period + "ly").toLocaleUpperCase()}</h3>
                  <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <div className="price">KSH{pricing.price}</div>
                    <span className="price-period">per {pricing.period}</span>
                  </div>
                </div>
                <ul className="features-list">
                  {pricing.features.map((feature, index) => {
                    return (
                      <li key={index}>
                        <i className="fas fa-check" /> {feature}
                      </li>
                    );
                  })}
                </ul>
                <button 
                  className="btn-subscribe" 
                  onClick={() => handleSubscribe(pricing)}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Pricing;