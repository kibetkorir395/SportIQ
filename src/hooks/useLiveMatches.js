// hooks/useLiveMatches.js
import { useState, useEffect, useRef, useCallback } from "react";
import { useSporticosApi } from "./useSporticosApi";

export const useLiveMatches = (options = {}) => {
  const {
    pollInterval = 30000,
    ids = [],
    autoStart = true,
  } = options;

  const { getLiveMatches, loading, error } = useSporticosApi();
  const [matches, setMatches] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const intervalRef = useRef();
  const isMountedRef = useRef(true);

  const fetchMatches = useCallback(async () => {
    try {
      const data = await getLiveMatches({ ids });
      if (isMountedRef.current) {
        setMatches(data?.data || []);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Live matches fetch error:", err);
    }
  }, [getLiveMatches, ids]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    fetchMatches();
    intervalRef.current = setInterval(fetchMatches, pollInterval);
  }, [fetchMatches, pollInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    if (autoStart) startPolling();
    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [autoStart, startPolling, stopPolling]);

  return {
    matches,
    loading,
    error,
    lastUpdate,
    refetch: fetchMatches,
    startPolling,
    stopPolling,
  };
};