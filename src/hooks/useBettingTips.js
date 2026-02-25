// hooks/useBettingTips.js
import { useState, useCallback, useEffect, useRef } from "react";
import { bettingTipsService } from "../services/bettingTipsService";

export const useBettingTips = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const abortControllerRef = useRef(null);

  const makeRequest = useCallback(async (apiCall, ...params) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(...params, {
        signal: abortControllerRef.current.signal,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      // Don't set error if request was cancelled
      if (err.name !== "AbortError") {
        const errorMessage =
          err.response?.data?.message || err.message || "An error occurred";
        setError(errorMessage);
        throw err;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const clearError = () => setError(null);
  const clearData = () => setData(null);

  return {
    // State
    loading,
    error,
    data,

    // Actions
    clearError,
    clearData,
    cancelRequest: () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    },

    // API Methods
    getAllTips: (params) => makeRequest(bettingTipsService.getAllTips, params),

    getTipsWithFilters: (filters) =>
      makeRequest(bettingTipsService.getTipsWithFilters, filters),

    getTipsByUser: (userId, params) =>
      makeRequest(bettingTipsService.getTipsByUser, userId, params),

    getTipsByLeague: (leagueId, params) =>
      makeRequest(bettingTipsService.getTipsByLeague, leagueId, params),

    getTipsByFixture: (fixtureId, params) =>
      makeRequest(bettingTipsService.getTipsByFixture, fixtureId, params),

    getTipsByBetType: (betType, params) =>
      makeRequest(bettingTipsService.getTipsByBetType, betType, params),

    getTipsByStatus: (status, params) =>
      makeRequest(bettingTipsService.getTipsByStatus, status, params),

    getTipsByConfidence: (confidence, params) =>
      makeRequest(bettingTipsService.getTipsByConfidence, confidence, params),

    getTipsByDateRange: (startDate, endDate, params) =>
      makeRequest(
        bettingTipsService.getTipsByDateRange,
        startDate,
        endDate,
        params
      ),

    getTipsWithPagination: (limit, offset, params) =>
      makeRequest(
        bettingTipsService.getTipsWithPagination,
        limit,
        offset,
        params
      ),
  };
};
