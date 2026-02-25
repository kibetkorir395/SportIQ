import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import Joyride from 'react-joyride';

// Sample predictions data (in real app, this would come from Firebase)
const samplePredictions = [
  {
    id: 1,
    league: "Premier League",
    matchTime: "Today • 15:00 GMT",
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    isPremium: true,
    predictions: [
      { market: "1X2", prediction: "1", confidence: 85, confidenceLevel: "high" },
      { market: "OVER/UNDER", prediction: "OVER 2.5", confidence: 72, confidenceLevel: "medium" },
      { market: "GG/NG", prediction: "GG", confidence: 78, confidenceLevel: "high" },
      { market: "Correct Score", prediction: "2-1", confidence: 68, confidenceLevel: "medium" }
    ],
    analysis: "City's home advantage and Liverpool's defensive issues suggest a home win. Both teams likely to score."
  },
  {
    id: 2,
    league: "La Liga",
    matchTime: "Today • 17:30 GMT",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    isPremium: true,
    predictions: [
      { market: "1X2", prediction: "X", confidence: 45, confidenceLevel: "low" },
      { market: "OVER/UNDER", prediction: "OVER 3.5", confidence: 82, confidenceLevel: "high" },
      { market: "GG/NG", prediction: "GG", confidence: 88, confidenceLevel: "high" },
      { market: "Correct Score", prediction: "2-2", confidence: 55, confidenceLevel: "medium" }
    ],
    analysis: "El Clasico always delivers drama. Expect goals from both sides in this high-stakes encounter."
  },
  {
    id: 3,
    league: "Serie A",
    matchTime: "Today • 19:45 GMT",
    homeTeam: "Inter Milan",
    awayTeam: "AC Milan",
    isPremium: true,
    predictions: [
      { market: "1X2", prediction: "1", confidence: 60, confidenceLevel: "medium" },
      { market: "OVER/UNDER", prediction: "UNDER 2.5", confidence: 65, confidenceLevel: "medium" },
      { market: "GG/NG", prediction: "NG", confidence: 55, confidenceLevel: "medium" },
      { market: "Correct Score", prediction: "1-0", confidence: 45, confidenceLevel: "low" }
    ],
    analysis: "Derby della Madonnina promises to be a tactical battle. Expect a tight, low-scoring affair."
  },
  {
    id: 4,
    league: "Bundesliga",
    matchTime: "Today • 14:30 GMT",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    isPremium: true,
    predictions: [
      { market: "1X2", prediction: "1", confidence: 75, confidenceLevel: "high" },
      { market: "OVER/UNDER", prediction: "OVER 3.5", confidence: 80, confidenceLevel: "high" },
      { market: "GG/NG", prediction: "GG", confidence: 70, confidenceLevel: "medium" },
      { market: "Correct Score", prediction: "3-1", confidence: 65, confidenceLevel: "medium" }
    ],
    analysis: "Der Klassiker! Bayern's home dominance and Dortmund's attacking style point to goals."
  }
];

function Tips({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { user, userProfile } = useFirebase(); //subscriptions 
  const { subscriptions, loading: subsLoading, hasActiveSubscription, activeSubscription } = useUserSubscriptions();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(true);
  const [unlockedCards, setUnlockedCards] = useState([]);

  // Check if user has active subscription
  //const hasActiveSubscription = subscriptions?.some(sub => sub.status === 'active');
  

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        // In real app, you'd fetch from Firebase here
        // const result = await getPredictions({ isPremium: true });
        // if (result.success) setPredictions(result.predictions);
      
        // Simulate API call
        setTimeout(() => {
          setPredictions(samplePredictions);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

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

        <div className="predictions-grid">
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
                </div>
                
                {/* Teams - Always visible */}
                <div 
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
                </div>

                {/* Predictions - Only show if unlocked */}
                {isUnlocked ? (
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
                )}

                {/* Unlock Button - Only show if not unlocked */}
                {!isUnlocked && (
                  <button 
                    className="btn-view-analysis btn-unlock" 
                    onClick={() => handleUnlock(prediction.id)}
                  >
                    Unlock Now
                  </button>
                )}
              </div>
            );
          })}
        </div>

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