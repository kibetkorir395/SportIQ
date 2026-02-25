import React, { useState, useEffect, useRef } from "react";
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
      { market: "1X2", prediction: "1", confidence: 85, confidenceClass: "high" },
      { market: "OVER/UNDER", prediction: "OVER 2.5", confidence: 72, confidenceClass: "medium" },
      { market: "GG/NG", prediction: "GG", confidence: 78, confidenceClass: "high" },
      { market: "Correct Score", prediction: "2-1", confidence: 68, confidenceClass: "medium" }
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
      { market: "1X2", prediction: "X", confidence: 45, confidenceClass: "low" },
      { market: "OVER/UNDER", prediction: "OVER 3.5", confidence: 82, confidenceClass: "high" },
      { market: "GG/NG", prediction: "GG", confidence: 88, confidenceClass: "high" },
      { market: "Correct Score", prediction: "2-2", confidence: 55, confidenceClass: "medium" }
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
      { market: "1X2", prediction: "1", confidence: 60, confidenceClass: "medium" },
      { market: "OVER/UNDER", prediction: "UNDER 2.5", confidence: 65, confidenceClass: "medium" },
      { market: "GG/NG", prediction: "NG", confidence: 55, confidenceClass: "medium" },
      { market: "Correct Score", prediction: "1-0", confidence: 45, confidenceClass: "low" }
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
      { market: "1X2", prediction: "1", confidence: 75, confidenceClass: "high" },
      { market: "OVER/UNDER", prediction: "OVER 3.5", confidence: 80, confidenceClass: "high" },
      { market: "GG/NG", prediction: "GG", confidence: 70, confidenceClass: "medium" },
      { market: "Correct Score", prediction: "3-1", confidence: 65, confidenceClass: "medium" }
    ],
    analysis: "Der Klassiker! Bayern's home dominance and Dortmund's attacking style point to goals."
  }
];

function Predictions({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const { subscriptions, loading: subsLoading, hasActiveSubscription } = useUserSubscriptions();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(true);
  const matchRefs = useRef([]);

  // Fetch predictions
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
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

  const handleShow = (e, predictionId) => {
    if (!user) {
      showModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login or create an account to access premium predictions',
        confirmText: 'Get Started',
        cancelText: 'Later',
        onConfirm: () => navigate('/get-started'),
        showCancel: true
      });
      return;
    }

    if (!hasActiveSubscription) {
      showModal({
        type: 'warning',
        title: 'Premium Feature',
        message: 'This prediction requires a premium subscription. Upgrade now to access all predictions!',
        confirmText: 'View Packages',
        cancelText: 'Later',
        onConfirm: () => navigate('/premium'),
        showCancel: true
      });
      return;
    }

    // User has active subscription - unlock the prediction
    const index = predictions.findIndex(p => p.id === predictionId);
    if (matchRefs.current[index]) {
      matchRefs.current[index].style.display = "flex";
    }
    e.target.style.display = "none";
    showNotification('🔓 Prediction unlocked!', 'success');
  };

  const isPageLoading = loading || subsLoading;

  const steps = [
    {
      target: '.predictions-grid',
      content: 'Browse through today\'s premium predictions',
      title: 'Premium Predictions',
      placement: 'top',
    },
    {
      target: '.prediction-card:first-child .btn-unlock',
      content: hasActiveSubscription 
        ? 'Click to unlock this prediction' 
        : 'Subscribe to unlock premium predictions',
      title: hasActiveSubscription ? 'Unlock Now' : 'Premium Feature',
      placement: 'bottom',
    }
  ];

  if (isPageLoading) {
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
        {user && !hasActiveSubscription && (
          <div className="subscription-banner inactive" style={{ marginBottom: "20px", padding: "10px", background: "#fff3cd", color: "#856404", borderRadius: "8px", textAlign: "center" }}>
            <p>🔒 You don't have an active subscription. <button onClick={() => navigate('/premium')} style={{ background: "none", border: "none", color: "#2c5aa0", textDecoration: "underline", cursor: "pointer" }}>Upgrade now</button> to unlock all predictions.</p>
          </div>
        )}

        {!user && (
          <div className="subscription-banner inactive" style={{ marginBottom: "20px", padding: "10px", background: "#e8f4e8", color: "#2c5aa0", borderRadius: "8px", textAlign: "center" }}>
            <p>👋 Welcome! <button onClick={() => navigate('/get-started')} style={{ background: "none", border: "none", color: "#2c5aa0", textDecoration: "underline", cursor: "pointer" }}>Sign in</button> or <button onClick={() => navigate('/get-started')} style={{ background: "none", border: "none", color: "#2c5aa0", textDecoration: "underline", cursor: "pointer" }}>create an account</button> to access premium predictions.</p>
          </div>
        )}

        <div className="prediction-filters" style={{ display: "none" }}>
          <button className="filter-btn active">All Matches</button>
          <button className="filter-btn">Top Leagues</button>
          <button className="filter-btn">Starting Soon</button>
          <button className="filter-btn">High Confidence</button>
        </div>

        <div className="predictions-grid">
          {predictions.map((prediction, index) => (
            <div className="prediction-card premium" key={prediction.id}>
              <div className="match-header">
                <span className="league">{prediction.matchTime} • {prediction.league}</span>
                <span className="premium-badge">Premium</span>
              </div>
              
              {/* Teams - Hidden by default, shown after unlock */}
              <div 
                className="teams" 
                ref={el => matchRefs.current[index] = el}
                style={{ background: "var(--light-gray)", display: "none" }}
              >
                <div className="team">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${prediction.homeTeam.replace(' ', '+')}&background=2c5aa0&color=fff&size=40`} 
                    alt={prediction.homeTeam}
                    style={{ display: "none" }}
                  />
                  <span>{prediction.homeTeam}</span>
                </div>
                <div className="vs">VS</div>
                <div className="team">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${prediction.awayTeam.replace(' ', '+')}&background=2c5aa0&color=fff&size=40`} 
                    alt={prediction.awayTeam}
                    style={{ display: "none" }}
                  />
                  <span>{prediction.awayTeam}</span>
                </div>
              </div>
              
              <div className="match-time" style={{ display: "none" }}>{prediction.matchTime}</div>

              <div>
                {prediction.predictions.map((item, idx) => (
                  <div className="prediction-item" key={idx}>
                    <span className="market">{item.market}</span>
                    <span className="prediction">{item.prediction}</span>
                    <span className={`confidence ${item.confidenceClass}`}>{item.confidence}%</span>
                  </div>
                ))}
              </div>

              <div className="analysis-preview" style={{ display: "none" }}>
                <h4>Expert Analysis</h4>
                <p>{prediction.analysis}</p>
                <button className="btn-view-analysis">View Full Analysis</button>
              </div>
              
              <button 
                className="btn-view-analysis btn-unlock" 
                onClick={(e) => handleShow(e, prediction.id)}
              >
                Unlock Now
              </button>
            </div>
          ))}
        </div>

        <div className="analysis-preview" style={{ marginTop: "20px" }}>
          <h4>Expert VIP Analysis</h4>
          <p>
            {!user 
              ? "Join thousands of winning bettors. Get started today!" 
              : !hasActiveSubscription 
                ? "Subscribe To A Premium Package To Start Winning With US."
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
                showNotification('You already have access!', 'info');
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

export default Predictions;