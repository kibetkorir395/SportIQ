// services/bettingTipsService.js
import axios from "axios";

const BASE_URL = "https://db.betcheckarena.com/functions/v1";

const bettingTipsApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const bettingTipsService = {
  // Get all tips with optional filters
  getAllTips: (params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips with specific filter criteria
  getTipsWithFilters: (filters = {}) => {
    const defaultFilters = {
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: 50,
    };

    const mergedFilters = { ...defaultFilters, ...filters };
    const queryParams = new URLSearchParams();

    // Convert filters to query parameters
    Object.entries(mergedFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        queryParams.append(key, value);
      }
    });

    return bettingTipsApi.get(`/tips-feed?${queryParams.toString()}`);
  },

  // Get tips by user ID
  getTipsByUser: (userId, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      user_id: `eq.${userId}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips by league
  getTipsByLeague: (leagueId, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      league_id: `eq.${leagueId}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips by fixture/match
  getTipsByFixture: (fixtureId, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      fixture_id: `eq.${fixtureId}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips by bet type
  getTipsByBetType: (betType, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      bet_type: `eq.${betType}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips by status (won/lost)
  getTipsByStatus: (status, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      status: `eq.${status}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips by confidence level
  getTipsByConfidence: (confidence, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      confidence: `eq.${confidence}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips within date range
  getTipsByDateRange: (startDate, endDate, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: "50",
      created_at: `gte.${startDate}`,
      created_at: `lte.${endDate}`,
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },

  // Get tips with pagination
  getTipsWithPagination: (limit = 50, offset = 0, params = {}) => {
    const queryParams = new URLSearchParams({
      select: "*",
      moderation_status: "eq.approved",
      is_publishable: "eq.true",
      order: "created_at.desc",
      limit: limit.toString(),
      offset: offset.toString(),
      ...params,
    }).toString();

    return bettingTipsApi.get(`/tips-feed?${queryParams}`);
  },
};

// Types for TypeScript (optional)
/*export const BetType = {
  WIN_DRAW_WIN: '1X2',
  BOTH_TEAMS_SCORE: 'Both Teams to Score',
  OVER_UNDER: 'Over / Under',
} as const;

export const ConfidenceLevel = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
} as const;

export const TipStatus = {
  WON: 'won',
  LOST: 'lost',
  PENDING: 'pending',
} as const;

// Response types
export interface Tip {
  id: string;
  user_id: string;
  fixture_id: number;
  league_id: number;
  league_name: string;
  match_teams: string;
  match_date: string;
  bet_type: string;
  odds: string;
  reasoning: string;
  confidence: string;
  status: string;
  created_at: string;
  published_at: string;
  user: {
    username: string;
    avatar_url: string | null;
    country_code: string;
    competition_points: number;
  };
  country: {
    name: string;
    flag: string;
  };
  bookmaker: {
    name: string | null;
    logo_url: string;
    url: string;
  };
}

export interface TipsResponse {
  tips: Tip[];
  count: number;
  filters: {
    limit: number;
    offset: number;
    days_back: number;
  };
  timestamp: string;
}*/
