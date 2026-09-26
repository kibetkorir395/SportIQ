// hooks/useLeague.js
import { useState, useEffect, useCallback } from "react";
import { useSporticosApi } from "./useSporticosApi";

export const useLeague = (leagueId, options = {}) => {
  const {
    autoFetch = true,
    limit = 10,
    offset = 0,
  } = options;

  const {
    getLeagueHeader,
    getLeagueTable,
    getLeagueFixtures,
    getLeagueLastResults,
    loading,
    error,
  } = useSporticosApi();

  const [league, setLeague] = useState({
    header: null,
    table: null,
    fixtures: null,
    lastResults: null,
  });

  const fetchLeague = useCallback(async () => {
    if (!leagueId) return;
    const result = { ...league };

    await Promise.allSettled([
      getLeagueHeader(leagueId).then((d) => (result.header = d)),
      getLeagueTable(leagueId).then((d) => (result.table = d)),
      getLeagueFixtures(leagueId, { limit, offset }).then(
        (d) => (result.fixtures = d),
      ),
      getLeagueLastResults(leagueId).then((d) => (result.lastResults = d)),
    ]);

    setLeague(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, limit, offset]);

  useEffect(() => {
    if (autoFetch && leagueId) fetchLeague();
  }, [leagueId, autoFetch, fetchLeague]);

  // Derived standings helpers
  const standings = league.table?.data || [];
  const topScorerTeam = standings[0] || null;

  return {
    ...league,
    standings,
    topScorerTeam,
    loading,
    error,
    refetch: fetchLeague,
  };
};