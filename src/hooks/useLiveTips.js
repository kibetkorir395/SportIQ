// hooks/useLiveTips.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useBettingTips } from "./useBettingTips";

export const useLiveTips = (pollInterval = 30000, limit = 50) => {
  const { getAllTips, loading, error } = useBettingTips();
  const [tips, setTips] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef();
  const isMountedRef = useRef(true);

  const fetchTips = useCallback(async () => {
    try {
      const result = await getAllTips({ limit });
      if (isMountedRef.current && result?.tips) {
        setTips(result.tips);
        setLastUpdate(new Date(result.timestamp));
      }
    } catch (err) {
      console.error("Error fetching tips:", err);
    }
  }, [getAllTips, limit]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Initial fetch
    fetchTips();

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchTips();
    }, pollInterval);
  }, [fetchTips, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    startPolling();

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  // Calculate statistics
  const statistics = {
    total: tips.length,
    won: tips.filter((tip) => tip.status === "won").length,
    lost: tips.filter((tip) => tip.status === "lost").length,
    winRate:
      tips.length > 0
        ? (
            (tips.filter((tip) => tip.status === "won").length / tips.length) *
            100
          ).toFixed(1)
        : 0,
    byConfidence: {
      high: tips.filter((tip) => tip.confidence === "high").length,
      medium: tips.filter((tip) => tip.confidence === "medium").length,
      low: tips.filter((tip) => tip.confidence === "low").length,
    },
  };

  // Get top tipsters
  const topTipsters = tips.reduce((acc, tip) => {
    const username = tip.user.username;
    if (!acc[username]) {
      acc[username] = {
        username,
        tips: 0,
        won: 0,
        lost: 0,
        points: tip.user.competition_points,
        country: tip.country,
      };
    }
    acc[username].tips++;
    if (tip.status === "won") acc[username].won++;
    if (tip.status === "lost") acc[username].lost++;
    return acc;
  }, {});

  return {
    tips,
    loading,
    error,
    lastUpdate,
    statistics,
    topTipsters: Object.values(topTipsters)
      .sort((a, b) => b.points - a.points)
      .slice(0, 10),
    refetch: fetchTips,
    startPolling,
    stopPolling,
  };
};
