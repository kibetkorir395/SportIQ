// hooks/useMatchPredictions.js
import { useState, useCallback, useEffect } from "react";
import { useSporticosApi } from "./useSporticosApi";

export const useMatchPredictions = (options = {}) => {
  const {
    autoFetch = false,
    date = new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    market = "full_time_result",
    lang = "en",
  } = options;

  const {
    getPredictionsByDate,
    getPredictionByMarket,
    getPredictionPosts,
    getPredictionByFixture,
    loading,
    error,
  } = useSporticosApi();

  const [predictions, setPredictions] = useState([]);
  const [meta, setMeta] = useState(null);

  const fetchByDate = useCallback(async () => {
    const data = await getPredictionsByDate(date);
    const list = Array.isArray(data) ? data : data?.data || [];
    setPredictions(list);
    setMeta({ date, source: "date" });
    return list;
  }, [getPredictionsByDate, date]);

  const fetchByMarket = useCallback(async () => {
    const data = await getPredictionByMarket({ market, date });
    const list = Array.isArray(data) ? data : data?.data || [];
    setPredictions(list);
    setMeta({ date, market, source: "market" });
    return list;
  }, [getPredictionByMarket, market, date]);

  const fetchByFixture = useCallback(
    async (fixtureParams) => {
      const data = await getPredictionByFixture({ ...fixtureParams, lang });
      setPredictions([data]);
      setMeta({ ...fixtureParams, source: "fixture" });
      return data;
    },
    [getPredictionByFixture, lang],
  );

  const fetchPosts = useCallback(
    async (params = {}) => {
      const data = await getPredictionPosts({ lang, ...params });
      return data;
    },
    [getPredictionPosts, lang],
  );

  useEffect(() => {
    if (autoFetch) fetchByDate();
  }, [autoFetch/*, fetchByDate*/]);

  return {
    predictions,
    meta,
    loading,
    error,
    fetchByDate,
    fetchByMarket,
    fetchByFixture,
    fetchPosts,
    refetch: fetchByDate,
  };
};