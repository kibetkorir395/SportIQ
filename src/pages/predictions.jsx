import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import { useMatchPredictions } from "../hooks/useMatchPredictions";
import Joyride from "react-joyride";

function Predictions({ showNotification, showModal }) {
    const navigate = useNavigate();
    const { user } = useFirebase();
    const {
        subscriptions,
        loading: subsLoading,
        hasActiveSubscription,
    } = useUserSubscriptions();

    const today = new Date().toISOString().slice(0, 10); // "2026-09-25"
    const { predictions, loading, error, fetchByDate, fetchPosts } =
        useMatchPredictions({
            autoFetch: true,
            date: today,
        });
    const [runTour, setRunTour] = useState(true);
    const matchRefs = useRef([]);

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


    const handleShow = (e, slug) => {
        if (!user) {
            showModal({
                type: "warning",
                title: "Login Required",
                message:
                    "Please login or create an account to access premium predictions",
                confirmText: "Get Started",
                cancelText: "Later",
                onConfirm: () => navigate("/get-started"),
                showCancel: true,
            });
            return;
        }

        if (!hasActiveSubscription) {
            showModal({
                type: "warning",
                title: "Premium Feature",
                message:
                    "This prediction requires a premium subscription. Upgrade now to access all predictions!",
                confirmText: "View Packages",
                cancelText: "Later",
                onConfirm: () => navigate("/premium"),
                showCancel: true,
            });
            return;
        }


        // Find index from the identical array that generated the DOM refs
        const index = filteredMatches.findIndex((match) => match.slug === slug);

        if (index !== -1 && matchRefs.current[index]) {
            matchRefs.current[index].style.display = "flex";
            e.target.style.display = "none";
            showNotification("🔓 Prediction unlocked!", "success");
        }
    };

    // Format ISO → "Today • 15:00 GMT"
    const formatMatchTime = (isoString) => {
        if (!isoString) return "";
        try {
            const d = new Date(isoString);
            const today = new Date();
            const isToday = d.toDateString() === today.toDateString();
            const time = d.toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
            });
            return `${isToday ? "Today" : d.toLocaleDateString("en-GB")} • ${time} GMT`;
        } catch {
            return isoString;
        }
    };


    const isPageLoading = loading || subsLoading;

    const steps = [
        {
            target: ".predictions-grid",
            content: "Browse through today's premium predictions",
            title: "Premium Predictions",
            placement: "top",
        },
        {
            target: ".prediction-card:first-child .btn-unlock",
            content: hasActiveSubscription
                ? "Click to unlock this prediction"
                : "Subscribe to unlock premium predictions",
            title: hasActiveSubscription ? "Unlock Now" : "Premium Feature",
            placement: "bottom",
        },
    ];

    if (isPageLoading) {
        return (
            <section id="predictions" className="predictions">
                <div className="container">
                    <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
                        Today's Premium Predictions
                    </h2>
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
                <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>
                    Today's Premium Predictions
                </h2>

                {/* User Status Banner */}
                {user && !hasActiveSubscription && (
                    <div
                        className="subscription-banner inactive"
                        style={{
                            marginBottom: "20px",
                            padding: "10px",
                            background: "#fff3cd",
                            color: "#856404",
                            borderRadius: "8px",
                            textAlign: "center",
                        }}
                    >
                        <p>
                            🔒 You don't have an active subscription.{" "}
                            <button
                                onClick={() => navigate("/premium")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#2c5aa0",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                            >
                                Upgrade now
                            </button>{" "}
                            to unlock all predictions.
                        </p>
                    </div>
                )}

                {!user && (
                    <div
                        className="subscription-banner inactive"
                        style={{
                            marginBottom: "20px",
                            padding: "10px",
                            background: "#e8f4e8",
                            color: "#2c5aa0",
                            borderRadius: "8px",
                            textAlign: "center",
                        }}
                    >
                        <p>
                            👋 Welcome!{" "}
                            <button
                                onClick={() => navigate("/get-started")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#2c5aa0",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                            >
                                Sign in
                            </button>{" "}
                            or{" "}
                            <button
                                onClick={() => navigate("/get-started")}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#2c5aa0",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                            >
                                create an account
                            </button>{" "}
                            to access premium predictions.
                        </p>
                    </div>
                )}

                <div className="prediction-filters" style={{ display: "none" }}>
                    <button className="filter-btn active">All Matches</button>
                    <button className="filter-btn">Top Leagues</button>
                    <button className="filter-btn">Starting Soon</button>
                    <button className="filter-btn">High Confidence</button>
                </div>

                <div className="predictions-grid">
                    {filteredMatches.map((prediction, index) => (
                        <div className="prediction-card premium" key={prediction.slug}>
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

                            {/* Teams - Hidden by default, shown after unlock */}
                            <div
                                className="teams"
                                ref={(el) => (matchRefs.current[index] = el)}
                                style={{ background: "var(--light-gray)", display: "none" }}
                            >
                                <div className="team">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${prediction.home.replace(
                                            " ",
                                            "+"
                                        )}&background=2c5aa0&color=fff&size=10`}
                                        alt={prediction.home}
                                    />
                                    <span>{prediction.home}</span>
                                </div>
                                <div className="vs">VS</div>
                                <div className="team">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${prediction.away.replace(
                                            " ",
                                            "+"
                                        )}&background=2c5aa0&color=fff&size=10`}
                                        alt={prediction.home}
                                    />
                                    <span>{prediction.away}</span>
                                </div>
                            </div>

                            <div className="match-time" style={{ display: "none" }}>
                                {prediction.start_time}
                            </div>

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
                                        <span className="confidence" style={{/* display: "none" */ }}>{details?.value}%</span>
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
                                onClick={(e) => handleShow(e, prediction.slug)}
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
                                showNotification("You already have access!", "info");
                            }
                        }}
                    >
                        {!user
                            ? "Get Started"
                            : !hasActiveSubscription
                                ? "View Packages"
                                : "View Predictions"}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Predictions;
