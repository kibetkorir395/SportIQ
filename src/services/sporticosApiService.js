// services/sporticosApiService.js
import axios from "axios";

const BASE_URL =
  import.meta?.env?.VITE_SPORTICOS_API_URL ||
  "https://sporticos-api-production.up.railway.app";

const sporticosApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Attach interceptors for consistent error shape
sporticosApi.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize upstream error shape from your API
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      "An error occurred";
    err.normalizedMessage = message;
    return Promise.reject(err);
  },
);

// Helper to build query strings, dropping null/undefined
const qs = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== null && v !== undefined && v !== "") {
      sp.append(k, Array.isArray(v) ? v.join(",") : v);
    }
  });
  const str = sp.toString();
  return str ? `?${str}` : "";
};

export const sporticosApiService = {
  // ============ DOCS & HEALTH ============
  getDocs: () => sporticosApi.get("/"),
  getHealth: () => sporticosApi.get("/api/health"),

  // ============ PROVIDERS & BOOKMAKERS ============
  getProviders: (params = {}) => {
    const { countryId = 4, isPublished = 1 } = params;
    return sporticosApi.get(
      `/api/providers${qs({ countryId, isPublished })}`,
    );
  },

  getBookmakers: () => sporticosApi.get("/api/bookmakers"),

  // ============ MATCHES & FIXTURES ============
  getLiveMatches: (params = {}) => {
    // Accept ids as array or comma string
    const { ids = [] } = params;
    const idsParam = Array.isArray(ids) ? ids.join(",") : ids;
    return sporticosApi.get(`/api/live${qs({ ids: idsParam })}`);
  },

  getCompetitionsWithMatches: (params = {}) => {
    const { limit = 50, offset = 0, fromDate, toDate } = params;
    return sporticosApi.get(
      `/api/matches/${qs({ limit, offset, fromDate, toDate })}`,
    );
  },

  getFixtures: () => sporticosApi.get("/api/fixtures"),

  // ============ MATCH DETAILS ============
  getMatch: (matchId) => sporticosApi.get(`/api/match/${matchId}`),

  getMatchHowToWatch: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/how-to-watch`),

  getMatchHeader: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/header`),

  getMatchTv: (matchId) => sporticosApi.get(`/api/match/${matchId}/tv`),

  getMatchVpnOffer: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/vpn-offer`),

  getMatchOddsAndPredictions: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/odds_and_predictions`),

  getMatchBettingTips: (matchId, params = {}) => {
    const { limit = 100, offset = 0 } = params;
    return sporticosApi.get(
      `/api/match/${matchId}/betting_tips${qs({ limit, offset })}`,
    );
  },

  getMatchHeadToHead: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/h2h`),

  getMatchBrackets: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/brackets`),

  getMatchFeeds: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/feeds`),

  getMatchForm: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/form`),

  getMatchStatistics: (matchId) =>
    sporticosApi.get(`/api/match/${matchId}/statistics`),

  // ============ PREDICTIONS ============
  getPredictionsByDate: (date) =>
    sporticosApi.get(`/api/predictions/${date}`),

  getPredictionPosts: (params = {}) => {
    const { limit = 50, offset = 0, is_published = 1, lang = "en" } = params;
    return sporticosApi.get(
      `/api/prediction_posts${qs({ limit, offset, is_published, lang })}`,
    );
  },

  getPredictionByMarket: (params = {}) => {
    const { market = "full_time_result", date } = params;
    return sporticosApi.get(
      `/api/prediction_market/${qs({ market, date })}`,
    );
  },

  getPredictionByFixture: (params = {}) => {
    const { homeTeamName, awayTeamName, date, lang = "en" } = params;
    return sporticosApi.get(
      `/api/prediction_fixture/${qs({
        homeTeamName,
        awayTeamName,
        date,
        lang,
      })}`,
    );
  },

  // ============ LEAGUES ============
  getLeagueHeader: (leagueId) =>
    sporticosApi.get(`/api/league/${leagueId}/header`),

  getLeagueTable: (leagueId) =>
    sporticosApi.get(`/api/league/${leagueId}/table`),

  getLeagueLastResults: (leagueId) =>
    sporticosApi.get(`/api/league/${leagueId}/lastResults`),

  getLeagueFixtures: (leagueId, params = {}) => {
    const { limit = 10, offset = 0 } = params;
    return sporticosApi.get(
      `/api/league/${leagueId}/fixtures${qs({ limit, offset })}`,
    );
  },

  // ============ POSTS & GUIDES ============
  getPosts: (params = {}) => {
    const { limit = 10, offset = 0, isPublished = 1, lang = "en" } = params;
    return sporticosApi.get(
      `/api/posts${qs({ limit, offset, isPublished, lang })}`,
    );
  },

  getPostById: (postId) => sporticosApi.get(`/api/posts/${postId}`),

  getPostByTitle: (title) =>
    sporticosApi.get(`/api/posts/${encodeURIComponent(title)}`),

  getGuides: (params = {}) => {
    const { limit = 50, offset = 0, isPublished = 1, lang = "en" } = params;
    return sporticosApi.get(
      `/api/guides${qs({ limit, offset, isPublished, lang })}`,
    );
  },
};

export default sporticosApiService;