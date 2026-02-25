// hooks/useLeagueTips.js
import { useState, useEffect } from "react";
import { useBettingTips } from "./useBettingTips";

export const useLeagueTips = (leagueId, options = {}) => {
  const { getTipsByLeague, loading, error } = useBettingTips();
  const [leagueTips, setLeagueTips] = useState([]);
  const [leagueStats, setLeagueStats] = useState(null);

  const {
    autoFetch = true,
    limit = 50,
    sortBy = "created_at",
    sortOrder = "desc",
  } = options;

  const fetchLeagueTips = async () => {
    try {
      const params = {
        limit,
        order: `${sortBy}.${sortOrder}`,
      };

      const result = await getTipsByLeague(leagueId, params);
      if (result?.tips) {
        setLeagueTips(result.tips);
        calculateLeagueStats(result.tips);
      }
    } catch (err) {
      console.error("Error fetching league tips:", err);
    }
  };

  const calculateLeagueStats = (tips) => {
    if (tips.length === 0) return;

    const stats = {
      total: tips.length,
      won: tips.filter((tip) => tip.status === "won").length,
      lost: tips.filter((tip) => tip.status === "lost").length,
      winRate: (
        (tips.filter((tip) => tip.status === "won").length / tips.length) *
        100
      ).toFixed(1),
      mostCommonBetType: getMostCommon(tips.map((tip) => tip.bet_type)),
      averageOdds: (
        tips.reduce((sum, tip) => sum + parseFloat(tip.odds), 0) / tips.length
      ).toFixed(2),
      topTipsters: getTopTipsters(tips),
      byMatch: groupTipsByFixture(tips),
    };

    setLeagueStats(stats);
  };

  const getMostCommon = (array) => {
    return array.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  };

  const getTopTipsters = (tips) => {
    const tipsterMap = tips.reduce((acc, tip) => {
      const username = tip.user.username;
      if (!acc[username]) {
        acc[username] = {
          username,
          tips: 0,
          won: 0,
          lost: 0,
          successRate: 0,
        };
      }
      acc[username].tips++;
      if (tip.status === "won") acc[username].won++;
      if (tip.status === "lost") acc[username].lost++;
      return acc;
    }, {});

    return Object.values(tipsterMap)
      .map((tipster) => ({
        ...tipster,
        successRate:
          tipster.tips > 0
            ? ((tipster.won / tipster.tips) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
  };

  const groupTipsByFixture = (tips) => {
    return tips.reduce((acc, tip) => {
      const fixtureKey = `${tip.fixture_id}_${tip.match_teams}`;
      if (!acc[fixtureKey]) {
        acc[fixtureKey] = {
          fixtureId: tip.fixture_id,
          matchTeams: tip.match_teams,
          matchDate: tip.match_date,
          tips: [],
        };
      }
      acc[fixtureKey].tips.push(tip);
      return acc;
    }, {});
  };

  useEffect(() => {
    if (autoFetch && leagueId) {
      fetchLeagueTips();
    }
  }, [leagueId, autoFetch]);

  return {
    tips: leagueTips,
    loading,
    error,
    stats: leagueStats,
    refetch: fetchLeagueTips,
  };
};
