import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import { useMatchPredictions } from "../hooks/useMatchPredictions";
import Joyride from "react-joyride";

// Map API confidence → UI level
const toConfidenceLevel = (confidence) => {
  if (typeof confidence === "number") {
    if (confidence >= 75) return "high";
    if (confidence >= 50) return "medium";
    return "low";
  }
  const c = String(confidence || "").toLowerCase();
  if (c.includes("high")) return "high";
  if (c.includes("low")) return "low";
  return "medium";
};

// Format ISO → "Today • 15:00 GMT"
const formatMatchTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
    return `${isToday ? "Today" : d.toLocaleDateString("en-GB")} • ${time} GMT`;
  } catch {
    return iso;
  }
};

// Adapt raw Sporticos prediction → shape this component expects
const adaptPrediction = (raw, index = 0) => {
  const home = raw.home_team || raw.homeTeam || raw.home || "Home";
  const away = raw.away_team || raw.awayTeam || raw.away || "Away";
  const league = raw.league_name || raw.league || raw.competition || "";
  const matchTime = formatMatchTime(raw.match_date || raw.kickoff || raw.date);

  let marketList = [];

  if (Array.isArray(raw.markets)) {
    marketList = raw.markets.map((m) => ({
      market: m.market || m.name || "1X2",
      prediction: m.prediction || m.value || m.selection || "-",
      confidence:
        typeof m.confidence === "number"
          ? m.confidence
          : parseFloat(m.confidence) || 60,
      confidenceLevel: toConfidenceLevel(m.confidence),
    }));
  } else if (raw.prediction) {
    marketList = [
      {
        market: raw.market || "1X2",
        prediction: raw.prediction,
        confidence:
          typeof raw.confidence === "number"
            ? raw.confidence
            : parseFloat(raw.confidence) || 60,
        confidenceLevel: toConfidenceLevel(raw.confidence),
      },
    ];
  }

  return {
    id: raw.id || raw.fixture_id || `pred-${index}`,
    league,
    matchTime,
    homeTeam: home,
    awayTeam: away,
    isPremium: raw.is_premium ?? true,
    predictions: marketList,
    analysis:
      raw.analysis ||
      raw.reasoning ||
      raw.expert_analysis ||
      "Expert analysis coming soon.",
    raw,
  };
};

function Tips({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { user, userProfile } = useFirebase();
  const {
    subscriptions,
    loading: subsLoading,
    hasActiveSubscription,
    activeSubscription,
  } = useUserSubscriptions();

  const [runTour, setRunTour] = useState(true);
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const {
    predictions: rawPredictions,
    loading,
    error,
    fetchByDate,
  } = useMatchPredictions({
    autoFetch: true,
    date,
  });

  const predictions = useMemo(
    () => (rawPredictions || []).map((p, i) => adaptPrediction(p, i)),
    [rawPredictions],
  );

  const isPageLoading = loading || subsLoading;

  const steps = [
    {
      target: '.predictions-grid',
      content: 'Browse through today\'s premium predictions',
      title: 'Premium Predictions',
      placement: 'top',
    },
    {
      target: '.prediction-card:first-child',
      content: hasActiveSubscription 
        ? 'Click on any prediction to view full details' 
        : 'Subscribe to unlock these premium predictions',
      title: hasActiveSubscription ? 'View Details' : 'Unlock Premium',
      placement: 'bottom',
    }
  ];

  const handleUnlock = (predictionId) => {
    if (!user) {
      // User not logged in
      showModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login or create an account to access premium predictions',
        confirmText: 'Get Started',
        cancelText: 'Later',
        onConfirm: () => navigate('/get-started'),
        showCancel: true
      });
    } else if (!hasActiveSubscription) {
      // User logged in but no active subscription
      showModal({
        type: 'warning',
        title: 'Premium Feature',
        message: 'This prediction requires a premium subscription. Upgrade now to access all predictions!',
        confirmText: 'View Packages',
        cancelText: 'Later',
        onConfirm: () => navigate('/premium'),
        showCancel: true
      });
    } else {
      // User has active subscription - unlock the prediction
      setUnlockedCards(prev => [...prev, predictionId]);
      showNotification('🔓 Prediction unlocked! View the full analysis below.', 'success');
      
      // Scroll to the unlocked card
      setTimeout(() => {
        const element = document.getElementById(`prediction-${predictionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleViewPackages = () => {
    navigate('/premium');
  };

  const getConfidenceClass = (level) => {
    switch(level) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  if (isPageLoading) { //if (loading) {
    return (
      <section id="predictions" className="predictions">
        <div className="container">
          <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Today's Premium Predictions</h2>
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading predictions...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="predictions" className="predictions">
      {/*<Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: { primaryColor: '#2c5aa0' }
        }}
      />*/}

      <div className="container">
        <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Today's Premium Predictions</h2>
        
        {/* User Status Banner */}
        {user && (
          <div className={`subscription-banner ${hasActiveSubscription ? 'active' : 'inactive'}`}>
            {hasActiveSubscription ? (
              <p>✨ You have an active {activeSubscription?.plan || 'premium'} subscription! All predictions are unlocked.</p>
            ) : (
              <p>🔒 You don't have an active subscription. <button onClick={handleViewPackages} className="text-link">Upgrade now</button> to unlock all predictions.</p>
            )}
          </div>
        )}

        {/* Show message for non-logged in users */}
        {!user && (
          <div className="subscription-banner inactive">
            <p>👋 Welcome! <button onClick={() => navigate('/get-started')} className="text-link">Sign in</button> or <button onClick={() => navigate('/get-started')} className="text-link">create an account</button> to access premium predictions.</p>
          </div>
        )}

        <div className="prediction-filters" style={{ display: "none" }}>
          <button className="filter-btn active">All Matches</button>
          <button className="filter-btn">Top Leagues</button>
          <button className="filter-btn">Starting Soon</button>
          <button className="filter-btn">High Confidence</button>
        </div>

        {/*<div className="predictions-grid">
          {predictions.map((prediction) => {
            const isUnlocked = unlockedCards.includes(prediction.id) || hasActiveSubscription;
            
            return (
              <div 
                key={prediction.id} 
                id={`prediction-${prediction.id}`}
                className={`prediction-card premium ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="match-header">
                  <span className="league">{prediction.matchTime} • {prediction.league}</span>
                  <span className="premium-badge">Premium</span>
                </div>*/}
                
                {/* Teams - Always visible */}
                {/*<div 
                  className="teams" 
                  style={{ background: "var(--light-gray)" }}
                >
                  <div className="team">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${prediction.homeTeam.replace(' ', '+')}&background=2c5aa0&color=fff&size=40`} 
                      alt={prediction.homeTeam}
                    />
                    <span>{prediction.homeTeam}</span>
                  </div>
                  <div className="vs">VS</div>
                  <div className="team">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${prediction.awayTeam.replace(' ', '+')}&background=2c5aa0&color=fff&size=40`} 
                      alt={prediction.awayTeam}
                    />
                    <span>{prediction.awayTeam}</span>
                  </div>
                </div>*/}

                {/* Predictions - Only show if unlocked */}
                {/*{isUnlocked ? (
                  <>
                    <div className="match-time">{prediction.matchTime}</div>
                    
                    <div>
                      {prediction.predictions.map((item, index) => (
                        <div className="prediction-item" key={index}>
                          <span className="market">{item.market}</span>
                          <span className="prediction">{item.prediction}</span>
                          <span className={`confidence ${getConfidenceClass(item.confidenceLevel)}`}>
                            {item.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="analysis-preview">
                      <h4>Expert Analysis</h4>
                      <p>{prediction.analysis}</p>
                      <button className="btn-view-analysis">View Full Analysis</button>
                    </div>
                  </>
                ) : (
                  // Locked content placeholder
                  <div className="locked-content">
                    <div className="lock-icon">🔒</div>
                    <p>Subscribe to view predictions for this match</p>
                  </div>
                )}*/}

                {/* Unlock Button - Only show if not unlocked */}
                {/*{!isUnlocked && (
                  <button 
                    className="btn-view-analysis btn-unlock" 
                    onClick={() => handleUnlock(prediction.id)}
                  >
                    Unlock Now
                  </button>
                )}*/}
              {/*</div>
            );
          })}
        </div>*/}

        {/* VIP Call to Action */}
        <div className="analysis-preview vip-cta" style={{ marginTop: "20px" }}>
          <h4>🎯 Expert VIP Analysis</h4>
          <p>
            {!user 
              ? "Join thousands of winning bettors. Get started today!" 
              : !hasActiveSubscription 
                ? "Subscribe to a premium package to start winning with us."
                : "You have access to all VIP predictions. Good luck!"}
          </p>
          <button 
            className="btn-view-analysis" 
            onClick={() => {
              if (!user) {
                navigate("/get-started");
              } else if (!hasActiveSubscription) {
                navigate("/premium");
              } else {
                showNotification('You already have access! Scroll up to view predictions.', 'info');
              }
            }}
          >
            {!user ? 'Get Started' : !hasActiveSubscription ? 'View Packages' : 'View Predictions'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Tips;