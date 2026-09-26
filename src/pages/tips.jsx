import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import { useMatchPredictions } from "../hooks/useMatchPredictions";
import Joyride from 'react-joyride';


function Tips({ showNotification, showModal }) {
    const navigate = useNavigate();
    const { user, userProfile } = useFirebase(); //subscriptions 
    const { subscriptions, loading: subsLoading, hasActiveSubscription, activeSubscription } = useUserSubscriptions();
    const [runTour, setRunTour] = useState(true);
    const [unlockedCards, setUnlockedCards] = useState([]);

    // Me1
    const today = new Date().toISOString().slice(0, 10); // "2026-09-25"
    const { predictions, loading, error, fetchByDate, fetchPosts } =
        useMatchPredictions({
            autoFetch: true,
            date: today,
        });

    // Me2
    //const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    /*function TipsInner({ date, ...rest }) {
        const { predictions, loading, error, fetchByDate } = useMatchPredictions({
            autoFetch: true,
            date,
        });
        // ...
    }*/

    // Me2 CHANGED: drive fetching solely via the hook (no duplicate useEffect fetch)
    /*const {
        predictions: rawPredictions,
        loading,
        error,
        fetchByDate,
    } = useMatchPredictions({
        autoFetch: true,
        date,
    });*/

    //Me2 NEW: adapt API shape → UI shape
    /*const predictions = useMemo(
        () => adaptPredictions(rawPredictions || []),
        [rawPredictions],
    );*/

    // Check if user has active subscription
    //const hasActiveSubscription = subscriptions?.some(sub => sub.status === 'active');


    // Fetch predictions
    // 1. Generate the exact filtered array used in your UI
    const filteredMatches = predictions ? predictions.flatMap((p) => {

        if (!p.matches) return [];
        return p.matches.filter((match) => {
            if (!match.predictions) return false;
            return Object.values(match.predictions).some((pred) => pred && pred.value > 50);
        }).map((match) => ({
            ...match,
            // Inject the parent league info directly into the match object
            leagueName: p.name,
            leagueCountry: p.country,
            leagueSlug: p.slug // Holds the {country, slug} object
        }));
    }) : [];

    const isPageLoading = loading || subsLoading;

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
        switch (level) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'medium';
        }
    };

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


    const formatMatchTime = (isoString) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return isoString; // Fallback if string is corrupt
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

    //Me2 NEW: surface API errors instead of silently showing nothing
    /*if (error) {
        return (
            <section id="predictions" className="predictions">
                <div className="container">
                    <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
                        Today's Premium Predictions
                    </h2>
                    <div className="subscription-banner inactive">
                        <p>⚠️ Could not load predictions: {error}</p>
                        <button className="text-link" onClick={() => fetchByDate()}>
                            Try again
                        </button>
                    </div>
                </div>
            </section>
        );
    }*/

    //Me2
    //return <TipsInner key={date} date={date} ... />;

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


                <div className="predictions-grid">
                    {filteredMatches.map((prediction, index) => {
                        const isUnlocked = unlockedCards.includes(prediction.id) || hasActiveSubscription;

                        return (
                            <div
                                key={prediction.id}
                                id={`prediction-${prediction.id}`}
                                className={`prediction-card premium ${isUnlocked ? 'unlocked' : 'locked'}`}
                            >
                                <div className="match-header">
                                    <span className="league">
                                        <img
                                            src={`https://sporticos.com/flags/${prediction.leagueCountry}.svg`}
                                            alt={prediction.away}
                                            style={{
                                                width: '25px',
                                                heigh: 'auto',
                                                borderRadius: '50%',
                                                marginRight: '5px'
                                            }}
                                        />{prediction.leagueName} • {formatMatchTime(prediction.start_time)}
                                    </span>
                                    <span className="premium-badge">Premium</span>
                                </div>

                                {/* Teams - Always visible */}
                                <div
                                    className="teams"
                                    style={{ background: "var(--light-gray)" }}
                                >
                                    <div className="team">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${prediction.home.replace(' ', '+')}&background=2c5aa0&color=fff&size=40`}
                                            alt={prediction.home}
                                        />
                                        <span>{prediction.home}</span>
                                    </div>
                                    <div className="vs">VS</div>
                                    <div className="team">
                                        <img
                                            src={`https://ui-avatars.com/api/?name=${prediction.away.replace(' ', '+')}&background=2c5aa0&color=fff&size=40`}
                                            alt={prediction.away}
                                        />
                                        <span>{prediction.away}</span>
                                    </div>
                                </div>

                                {/* Predictions - Only show if unlocked */}
                                {isUnlocked ? (
                                    <>
                                        <div className="match-time">{prediction.matchTime}</div>
                                        <div>
                                            {Object.entries(prediction.predictions)/*.filter((predic) => {
                    return predic[1].value > 60;
                    
                    })*/.map(([key, details], idx) => (
                                                <div className="prediction-item" key={idx}>
                                                    <span className="market">
                                                        {key === "full_time_result"
                                                            ? "1X2"
                                                            : key === "over_under25"
                                                                ? "OVER/UNDER"
                                                                : "GG/NG"}
                                                    </span>
                                                    <span className="prediction">{details?.label?.toUpperCase()}</span>
                                                    <span className={/*`confidence ${getConfidenceClass(item.confidenceLevel)}`*/''} style={{/* display: "none" */ }}>{details?.value}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="analysis-preview" style={{ display: "none" }}>
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
                                        onClick={() => handleUnlock(prediction.slug)}
                                    >
                                        Unlock Now
                                    </button>
                                )}
                            </div>)
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