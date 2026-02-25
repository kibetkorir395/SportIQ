// hooks/useUserTips.js
import { useState, useEffect } from "react";
import { useBettingTips } from "./useBettingTips";

export const useUserTips = (userId, options = {}) => {
  const { getTipsByUser, loading, error } = useBettingTips();
  const [userTips, setUserTips] = useState([]);
  const [userStats, setUserStats] = useState(null);

  const {
    autoFetch = true,
    limit = 50,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  const fetchUserTips = async () => {
    try {
      const params = {
        limit,
        order: `${sortBy}.${sortOrder}`,
      };

      const result = await getTipsByUser(userId, params);
      if (result?.tips) {
        setUserTips(result.tips);
        calculateUserStats(result.tips);
      }
    } catch (err) {
      console.error("Error fetching user tips:", err);
    }
  };

  const calculateUserStats = (tips) => {
    const stats = {
      total: tips.length,
      won: tips.filter((tip) => tip.status === "won").length,
      lost: tips.filter((tip) => tip.status === "lost").length,
      pending: tips.filter((tip) => tip.status === "pending").length,
      winRate:
        (tips.filter((tip) => tip.status === "won").length / tips.length) * 100,
      averageOdds:
        tips.reduce((sum, tip) => sum + parseFloat(tip.odds), 0) / tips.length,
      byConfidence: {
        high: tips.filter((tip) => tip.confidence === "high").length,
        medium: tips.filter((tip) => tip.confidence === "medium").length,
        low: tips.filter((tip) => tip.confidence === "low").length,
      },
      byLeague: tips.reduce((acc, tip) => {
        const league = tip.league_name;
        if (!acc[league]) acc[league] = 0;
        acc[league]++;
        return acc;
      }, {}),
      byBetType: tips.reduce((acc, tip) => {
        const betType = tip.bet_type;
        if (!acc[betType]) acc[betType] = 0;
        acc[betType]++;
        return acc;
      }, {}),
    };

    setUserStats(stats);
  };

  useEffect(() => {
    if (autoFetch && userId) {
      fetchUserTips();
    }
  }, [userId, autoFetch]);

  return {
    tips: userTips,
    loading,
    error,
    stats: userStats,
    refetch: fetchUserTips,
  };
};
