// hooks/useSporticosApi.js
import { useState, useCallback, useEffect, useRef } from "react";
import sporticosApiService from "../services/sporticosApiService";

export const useSporticosApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const makeRequest = useCallback(async (apiCall, ...params) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...params, {
        signal: abortControllerRef.current.signal,
      });
      if (isMountedRef.current) setData(response.data);
      return response.data;
    } catch (err) {
      if (err.name !== "AbortError" && isMountedRef.current) {
        const message =
          err.normalizedMessage ||
          err.response?.data?.message ||
          err.message ||
          "An error occurred";
        setError(message);
        throw err;
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    data,
    clearError: () => setError(null),
    clearData: () => setData(null),
    cancelRequest: () => abortControllerRef.current?.abort(),

    // Docs & Health
    getDocs: () => makeRequest(sporticosApiService.getDocs),
    getHealth: () => makeRequest(sporticosApiService.getHealth),

    // Providers & Bookmakers
    getProviders: (params) =>
      makeRequest(sporticosApiService.getProviders, params),
    getBookmakers: () => makeRequest(sporticosApiService.getBookmakers),

    // Matches & Fixtures
    getLiveMatches: (params) =>
      makeRequest(sporticosApiService.getLiveMatches, params),
    getCompetitionsWithMatches: (params) =>
      makeRequest(sporticosApiService.getCompetitionsWithMatches, params),
    getFixtures: () => makeRequest(sporticosApiService.getFixtures),

    // Match details
    getMatch: (id) => makeRequest(sporticosApiService.getMatch, id),
    getMatchHowToWatch: (id) =>
      makeRequest(sporticosApiService.getMatchHowToWatch, id),
    getMatchHeader: (id) =>
      makeRequest(sporticosApiService.getMatchHeader, id),
    getMatchTv: (id) => makeRequest(sporticosApiService.getMatchTv, id),
    getMatchVpnOffer: (id) =>
      makeRequest(sporticosApiService.getMatchVpnOffer, id),
    getMatchOddsAndPredictions: (id) =>
      makeRequest(sporticosApiService.getMatchOddsAndPredictions, id),
    getMatchBettingTips: (id, params) =>
      makeRequest(sporticosApiService.getMatchBettingTips, id, params),
    getMatchHeadToHead: (id) =>
      makeRequest(sporticosApiService.getMatchHeadToHead, id),
    getMatchBrackets: (id) =>
      makeRequest(sporticosApiService.getMatchBrackets, id),
    getMatchFeeds: (id) => makeRequest(sporticosApiService.getMatchFeeds, id),
    getMatchForm: (id) => makeRequest(sporticosApiService.getMatchForm, id),
    getMatchStatistics: (id) =>
      makeRequest(sporticosApiService.getMatchStatistics, id),

    // Predictions
    getPredictionsByDate: (date) =>
      makeRequest(sporticosApiService.getPredictionsByDate, date),
    getPredictionPosts: (params) =>
      makeRequest(sporticosApiService.getPredictionPosts, params),
    getPredictionByMarket: (params) =>
      makeRequest(sporticosApiService.getPredictionByMarket, params),
    getPredictionByFixture: (params) =>
      makeRequest(sporticosApiService.getPredictionByFixture, params),

    // Leagues
    getLeagueHeader: (id) =>
      makeRequest(sporticosApiService.getLeagueHeader, id),
    getLeagueTable: (id) => makeRequest(sporticosApiService.getLeagueTable, id),
    getLeagueLastResults: (id) =>
      makeRequest(sporticosApiService.getLeagueLastResults, id),
    getLeagueFixtures: (id, params) =>
      makeRequest(sporticosApiService.getLeagueFixtures, id, params),

    // Posts & Guides
    getPosts: (params) => makeRequest(sporticosApiService.getPosts, params),
    getPostById: (id) => makeRequest(sporticosApiService.getPostById, id),
    getPostByTitle: (title) =>
      makeRequest(sporticosApiService.getPostByTitle, title),
    getGuides: (params) => makeRequest(sporticosApiService.getGuides, params),
  };
};