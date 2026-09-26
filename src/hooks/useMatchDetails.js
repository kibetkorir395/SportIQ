// hooks/useMatchDetails.js
import { useState, useEffect, useCallback } from "react";
import { useSporticosApi } from "./useSporticosApi";

export const useMatchDetails = (matchId, options = {}) => {
  const {
    autoFetch = true,
    include = ["header", "statistics", "h2h", "form"],
  } = options;

  const {
    getMatch,
    getMatchHeader,
    getMatchStatistics,
    getMatchHeadToHead,
    getMatchForm,
    getMatchOddsAndPredictions,
    getMatchTv,
    getMatchHowToWatch,
    loading,
    error,
  } = useSporticosApi();

  const [details, setDetails] = useState({
    match: null,
    header: null,
    statistics: null,
    h2h: null,
    form: null,
    odds: null,
    tv: null,
    howToWatch: null,
  });
  const [localError, setLocalError] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!matchId) return;
    setLocalError(null);

    const tasks = [];
    const result = { ...details };

    try {
      if (include.includes("match")) {
        tasks.push(
          getMatch(matchId).then((d) => (result.match = d)),
        );
      }
      if (include.includes("header")) {
        tasks.push(
          getMatchHeader(matchId).then((d) => (result.header = d)),
        );
      }
      if (include.includes("statistics")) {
        tasks.push(
          getMatchStatistics(matchId).then((d) => (result.statistics = d)),
        );
      }
      if (include.includes("h2h")) {
        tasks.push(
          getMatchHeadToHead(matchId).then((d) => (result.h2h = d)),
        );
      }
      if (include.includes("form")) {
        tasks.push(
          getMatchForm(matchId).then((d) => (result.form = d)),
        );
      }
      if (include.includes("odds")) {
        tasks.push(
          getMatchOddsAndPredictions(matchId).then((d) => (result.odds = d)),
        );
      }
      if (include.includes("tv")) {
        tasks.push(getMatchTv(matchId).then((d) => (result.tv = d)));
      }
      if (include.includes("howToWatch")) {
        tasks.push(
          getMatchHowToWatch(matchId).then((d) => (result.howToWatch = d)),
        );
      }

      await Promise.allSettled(tasks);
      setDetails(result);
    } catch (err) {
      setLocalError(err.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, include.join(",")]);

  useEffect(() => {
    if (autoFetch && matchId) fetchAll();
  }, [matchId, autoFetch, fetchAll]);

  return {
    ...details,
    loading,
    error: error || localError,
    refetch: fetchAll,
  };
};