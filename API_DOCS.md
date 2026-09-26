# Sporticos API Service + Hooks

## 4. Example Usage

### Live matches dashboard

```jsx
import { useLiveMatches } from "../hooks/useLiveMatches";

export default function LiveMatchesPage() {
  const { matches, loading, error, lastUpdate, startPolling, stopPolling } =
    useLiveMatches({ pollInterval: 20000, ids: [1431908, 1433768] });

  if (loading && matches.length === 0) return <p>Loading live matches…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2>Live Matches</h2>
        <small>Last update: {lastUpdate?.toLocaleTimeString()}</small>
      </div>

      {matches.map((m) => (
        <div key={m.id} className="border p-3 rounded mb-2">
          <strong>{m.home_team_name}</strong> vs{" "}
          <strong>{m.away_team_name}</strong>
          <span className="ml-2">{m.score || "0 - 0"}</span>
        </div>
      ))}
    </div>
  );
}
```

### League page

```jsx
import { useLeague } from "../hooks/useLeague";

export default function LeaguePage({ leagueId = 1 }) {
  const { header, standings, fixtures, lastResults, loading, error } =
    useLeague(leagueId, { limit: 10 });

  if (loading) return <p>Loading league…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{header?.data?.name}</h1>

      <h3>Standings</h3>
      <ul>
        {standings.map((row, i) => (
          <li key={i}>
            {i + 1}. {row.team_name} — {row.points} pts
          </li>
        ))}
      </ul>

      <h3>Upcoming fixtures</h3>
      <ul>
        {(fixtures?.data?.data || []).map((f) => (
          <li key={f.id}>{f.home_team_name} vs {f.away_team_name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Match detail page

```jsx
import { useMatchDetails } from "../hooks/useMatchDetails";

export default function MatchPage({ matchId }) {
  const {
    header,
    statistics,
    h2h,
    form,
    odds,
    loading,
    error,
    refetch,
  } = useMatchDetails(matchId, {
    include: ["header", "statistics", "h2h", "form", "odds"],
  });

  if (loading) return <p>Loading match…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>
        {header?.data?.home_team_name} vs {header?.data?.away_team_name}
      </h1>

      <section>
        <h3>Odds & Predictions</h3>
        <pre>{JSON.stringify(odds, null, 2)}</pre>
      </section>

      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## 5. What You Still Need to Fix in Your API

Your README already flags these — the new service layer **can't** work around all of them:

| # | Endpoint | Problem | Fix on API side |
|---|---|---|---|
| 1 | `/api/live` | Handler hardcodes `{ ids: [] }` | Forward `req.query.ids` |
| 2 | `/api/predictions/:date` | References undefined `sport` | Define `const sport = "/soccer"` |
| 3 | `/api/prediction_posts` | References undefined `date` | Remove `date` from response or define it |
| 4 | `/api/prediction_fixture/` | Handler passes an object where service expects `(matchId, params)` | Fix signature or handler call |
| 5 | `/api/posts/:postId` vs `/api/posts/:title` | Duplicate routes, second unreachable | Prefix one e.g. `/api/posts/title/:title` |
| 6 | `getTvProviders` | `?${countryId}` malformed | Should be `?country_id=${countryId}` |
| 7 | `getLiveMatches` | `/live&ids=...` wrong separator | Should be `/live?ids=...` |
| 8 | `getLeagueFixtures` | `&?offset=` stray `?` | Should be `&offset=` |
| 9 | CORS | Missing on API | Add `cors` middleware (previous answer) |

Once those are fixed, everything above will Just Work™ with no frontend changes.

---

## 6. File Tree Summary

```
src/
├── services/
│   └── sporticosApiService.js       ← new
├── hooks/
│   ├── useSporticosApi.js           ← new (core)
│   ├── useMatchDetails.js           ← new
│   ├── useLiveMatches.js            ← new
│   ├── useLeague.js                 ← new
│   ├── useMatchPredictions.js       ← new
│   └── useNewsPosts.js              ← new
└── .env                             ← VITE_SPORTICOS_API_URL=...
```

This mirrors your existing `bettingTipsService` + `useBettingTips` / `useLeagueTips` / `useLiveTips` / `useUserTips` pattern exactly — same shape, same abort semantics, same error handling — just pointed at your own Sporticos API.



# `useMatchPredictions` — Full Usage Examples

Below are several real-world usage patterns for the hook, from a simple date-based list to a full market/fixture picker UI.

---

## 1. Basic: predictions for today

```jsx
// components/TodaysPredictions.jsx
import { useMatchPredictions } from "../hooks/useMatchPredictions";

export default function TodaysPredictions() {
  const today = new Date().toISOString().slice(0, 10); // "2026-09-25"
  const { predictions, loading, error, fetchByDate } = useMatchPredictions({
    autoFetch: true,
    date: today,
  });

  if (loading) return <p>Loading predictions…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h2>Predictions for {today}</h2>
        <button onClick={fetchByDate}>Refresh</button>
      </div>

      {predictions.length === 0 && <p>No predictions for today.</p>}

      <ul>
        {predictions.map((p, i) => (
          <li key={p.id || i} className="border-b py-2">
            <strong>{p.home_team}</strong> vs <strong>{p.away_team}</strong>
            <span className="ml-2 text-xs">
              {p.prediction} · {p.confidence}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 2. Date picker — refetch on date change

```jsx
// components/PredictionsByDate.jsx
import { useState } from "react";
import { useMatchPredictions } from "../hooks/useMatchPredictions";

export default function PredictionsByDate() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { predictions, loading, error, fetchByDate } = useMatchPredictions({
    autoFetch: false, // we'll drive it manually
  });

  // fetch whenever date changes
  useEffect(() => {
    fetchByDate();
  }, [date, fetchByDate]);

  // The hook's `date` option is fixed at creation, so pass it through the
  // options when you remount OR call the service directly. Simplest fix:
  // recreate the hook via key, or override via a manual fetch.
  // See pattern #3 for a cleaner approach.

  return (
    <div>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      {loading && <p>Loading…</p>}
      {error && <p>Error: {error}</p>}
      <ul>
        {predictions.map((p, i) => (
          <li key={i}>
            {p.home_team} vs {p.away_team} — {p.prediction}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

> ⚠️ Note: The `date` option is captured when the hook is created. For a *cleaner* date-driven flow, use the **`useSporticosApi` core hook** directly (pattern #3), or remount the hook with `key={date}`.

---

## 3. Recommended: use the core hook for full control

This gives you explicit `date` / `market` arguments and avoids the stale-closure issue.

```jsx
// components/PredictionsExplorer.jsx
import { useState, useEffect, useCallback } from "react";
import { useSporticosApi } from "../hooks/useSporticosApi";

const MARKETS = [
  { value: "full_time_result", label: "1X2" },
  { value: "over_under_25", label: "Over/Under 2.5" },
  { value: "btts", label: "Both Teams to Score" },
];

export default function PredictionsExplorer() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [market, setMarket] = useState("full_time_result");
  const [predictions, setPredictions] = useState([]);

  const {
    getPredictionsByDate,
    getPredictionByMarket,
    loading,
    error,
  } = useSporticosApi();

  const load = useCallback(async () => {
    try {
      // If market === "full_time_result", use the date endpoint (returns all)
      // Otherwise use the market endpoint.
      const data =
        market === "full_time_result"
          ? await getPredictionsByDate(date)
          : await getPredictionByMarket({ market, date });

      const list = Array.isArray(data) ? data : data?.data || [];
      setPredictions(list);
    } catch (e) {
      // error is already in hook state
    }
  }, [date, market, getPredictionsByDate, getPredictionByMarket]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select value={market} onChange={(e) => setMarket(e.target.value)}>
          {MARKETS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <button onClick={load} disabled={loading}>
          {loading ? "Loading…" : "Reload"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {predictions.length === 0 && !loading && <p>No predictions found.</p>}

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th align="left">Match</th>
            <th align="left">Prediction</th>
            <th align="left">Odds</th>
            <th align="left">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p, i) => (
            <tr key={p.id || i}>
              <td>
                {p.home_team} vs {p.away_team}
              </td>
              <td>{p.prediction}</td>
              <td>{p.odds}</td>
              <td>{p.confidence}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 4. Fixture-specific prediction (by team names + date)

```jsx
// components/FixturePrediction.jsx
import { useState } from "react";
import { useMatchPredictions } from "../hooks/useMatchPredictions";

export default function FixturePrediction() {
  const { fetchByFixture, loading, error, predictions } =
    useMatchPredictions();

  const [form, setForm] = useState({
    homeTeamName: "augsburg",
    awayTeamName: "cologne",
    date: "27-02-2026", // DD-MM-YYYY per API docs
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchByFixture(form);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          placeholder="Home team"
          value={form.homeTeamName}
          onChange={(e) =>
            setForm({ ...form, homeTeamName: e.target.value })
          }
        />
        <input
          placeholder="Away team"
          value={form.awayTeamName}
          onChange={(e) =>
            setForm({ ...form, awayTeamName: e.target.value })
          }
        />
        <input
          placeholder="DD-MM-YYYY"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Get Prediction"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {predictions.map((p, i) => (
        <div key={i} className="mt-4 border p-3">
          <h3>
            {p.home_team} vs {p.away_team}
          </h3>
          <p>
            <strong>Tip:</strong> {p.prediction}
          </p>
          <p>
            <strong>Odds:</strong> {p.odds}
          </p>
          <p>
            <strong>Reasoning:</strong> {p.reasoning}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## 5. Prediction posts (news-style articles)

```jsx
// components/PredictionPosts.jsx
import { useState, useEffect } from "react";
import { useMatchPredictions } from "../hooks/useMatchPredictions";

export default function PredictionPosts() {
  const { fetchPosts, loading, error } = useMatchPredictions();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await fetchPosts({ limit: 10, offset: 0 });
      setPosts(data?.data?.data || data?.data || []);
    })();
  }, [fetchPosts]);

  if (loading) return <p>Loading posts…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <article key={post.id} className="border p-4 rounded">
          <h3 className="font-bold">{post.title}</h3>
          <p className="text-sm text-gray-600">{post.excerpt}</p>
          <a
            href={post.slug ? `/posts/${post.slug}` : "#"}
            className="text-blue-500 text-sm"
          >
            Read more →
          </a>
        </article>
      ))}
    </div>
  );
}
```

---

## 6. Composed: combine predictions with live matches

A common dashboard pattern — show today's predictions *and* which ones are live now.

```jsx
// components/PredictionsLiveDashboard.jsx
import { useMatchPredictions } from "../hooks/useMatchPredictions";
import { useLiveMatches } from "../hooks/useLiveMatches";

export default function PredictionsLiveDashboard() {
  const today = new Date().toISOString().slice(0, 10);

  const { predictions, loading: predLoading, error: predError } =
    useMatchPredictions({ autoFetch: true, date: today });

  const { matches, loading: liveLoading } = useLiveMatches({
    pollInterval: 30000,
  });

  // Index live matches by fixture id for quick lookup
  const liveById = new Map((matches || []).map((m) => [m.id, m]));

  return (
    <div className="grid grid-cols-2 gap-6">
      <section>
        <h2>Today's Predictions</h2>
        {predLoading && <p>Loading…</p>}
        {predError && <p style={{ color: "red" }}>{predError}</p>}

        <ul>
          {predictions.map((p, i) => {
            const live = liveById.get(p.fixture_id);
            return (
              <li key={p.id || i} className="border-b py-2 flex justify-between">
                <span>
                  {p.home_team} vs {p.away_team}
                  {live && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-1 rounded">
                      LIVE {live.score}
                    </span>
                  )}
                </span>
                <span className="text-sm">
                  {p.prediction} @ {p.odds}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2>Live Now</h2>
        {liveLoading && <p>Loading…</p>}
        <ul>
          {matches.map((m) => (
            <li key={m.id}>
              {m.home_team_name} {m.score} {m.away_team_name}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
```

---

## 7. Fetch-on-demand with error boundary

```jsx
// components/PredictionSearch.jsx
import { useState } from "react";
import { useMatchPredictions } from "../hooks/useMatchPredictions";

export default function PredictionSearch() {
  const { fetchByMarket, predictions, loading, error, meta } =
    useMatchPredictions({ autoFetch: false });

  const [query, setQuery] = useState({
    market: "btts",
    date: "2026-09-25",
  });

  const handleSearch = async () => {
    try {
      await fetchByMarket(query); // uses hook's `market`/`date`? No —
      // see note below
    } catch (e) {
      // handled by hook
    }
  };

  // Because the hook's market/date are captured at creation,
  // for dynamic searches use the core hook directly (pattern #3)
  // or remount with key.

  return null;
}
```

> ⚠️ **Important gotcha**: `fetchByMarket` inside `useMatchPredictions` reads `market` and `date` from the hook's *initial options*, not from arguments. If you need dynamic market/date switching, either:
> - remount: `<PredictionSearch key={`${market}-${date}`} />`
> - or use `useSporticosApi` directly (pattern #3), which is what I recommend.

---

## 8. Best practice — a wrapper hook for dynamic params

If you want to keep the ergonomics of `useMatchPredictions` but drive it dynamically, wrap it:

```jsx
// hooks/useDynamicPredictions.js
import { useSporticosApi } from "./useSporticosApi";
import { useState, useCallback, useEffect } from "react";

export const useDynamicPredictions = ({ date, market = "full_time_result" }) => {
  const { getPredictionsByDate, getPredictionByMarket, loading, error } =
    useSporticosApi();
  const [predictions, setPredictions] = useState([]);

  const load = useCallback(async () => {
    if (!date) return;
    const data =
      market === "full_time_result"
        ? await getPredictionsByDate(date)
        : await getPredictionByMarket({ market, date });
    setPredictions(Array.isArray(data) ? data : data?.data || []);
  }, [date, market, getPredictionsByDate, getPredictionByMarket]);

  useEffect(() => {
    load();
  }, [load]);

  return { predictions, loading, error, refetch: load };
};
```

Usage:

```jsx
const [market, setMarket] = useState("full_time_result");
const { predictions, loading, error, refetch } = useDynamicPredictions({
  date: "2026-09-25",
  market,
});

// changing `market` re-fetches automatically
<select value={market} onChange={(e) => setMarket(e.target.value)} />
```

---

## Quick reference — what each function does

| Function | Params | Endpoint hit | Returns |
|---|---|---|---|
| `fetchByDate()` | *(uses hook `date`)* | `GET /api/predictions/:date` | list of predictions |
| `fetchByMarket()` | *(uses hook `market` + `date`)* | `GET /api/prediction_market/?market=&date=` | list for that market |
| `fetchByFixture(params)` | `{ homeTeamName, awayTeamName, date, lang? }` | `GET /api/prediction_fixture/` | single prediction object |
| `fetchPosts(params)` | `{ limit, offset, is_published, lang }` | `GET /api/prediction_posts` | articles |
| `refetch()` | — | re-runs `fetchByDate` | — |

---

## TL;DR — which pattern should you use?

- **Static date at page load** → `useMatchPredictions({ autoFetch: true, date })`
- **Dynamic date/market picker** → use `useDynamicPredictions` wrapper (pattern #8) or `useSporticosApi` directly (pattern #3)
- **Fixture-specific lookup** → `useMatchPredictions().fetchByFixture({...})` (pattern #4)
- **News articles** → `useMatchPredictions().fetchPosts({...})` (pattern #5)


# Replacing Sample Data with Real API Data in `Tips.jsx`

Here's your file rewritten to use the real `useMatchPredictions` hook. Two versions below: **minimal change** (keep sample shape as fallback) and **full replacement** (map API → UI shape).

---

## The problem in your current code

You have a **variable collision** and a **double fetch**:

```js
const [predictions, setPredictions] = useState([]);           // #1 — your state
const { predictions, loading, error, fetchByDate } = useMatchPredictions(...); // #2 — hook's state
```

The hook's `predictions` **shadows** your `useState` one. So:

- `setPredictions(samplePredictions)` inside your `useEffect` updates the **shadowed** state — invisible to render.
- The rendered grid uses the **hook's** `predictions`, which comes from the API but has a different shape than your UI expects (`homeTeam`, `awayTeam`, `matchTime`, etc.).
- You also fetch twice: `autoFetch: true` **and** the manual `useEffect(() => fetchByDate(), [date])`.

Let me fix all of that.

---

## Step 1 — Build an adapter (API shape → UI shape)

Your API returns fields like `home_team`, `away_team`, `match_date`, `prediction`, `odds`, `confidence`, etc. (depends on your Sporticos schema). Your UI needs `homeTeam`, `awayTeam`, `matchTime`, `league`, `predictions[]`, `analysis`.

Add a helper — put it in `services/sporticosApiService.js` or a new `utils/adapters.js`:

```js
// utils/adapters.js

// Map confidence string/number → UI level
const toConfidenceLevel = (confidence) => {
  if (typeof confidence === "number") {
    if (confidence >= 75) return "high";
    if (confidence >= 50) return "medium";
    return "low";
  }
  const c = String(confidence || "").toLowerCase();
  if (c.includes("high")) return "high";
  if (c.includes("low")) return "low";
  return "medium";
};

// Format "2026-09-25T15:00:00Z" → "Today • 15:00 GMT"
const formatMatchTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
    return `${isToday ? "Today" : d.toLocaleDateString("en-GB")} • ${time} GMT`;
  } catch {
    return iso;
  }
};

/**
 * Adapts a raw Sporticos API prediction into the shape Tips.jsx expects.
 */
export const adaptPrediction = (raw, index = 0) => {
  // The API may return predictions in different shapes depending on endpoint.
  // This handles the common cases defensively.
  const home = raw.home_team || raw.homeTeam || raw.home || "Home";
  const away = raw.away_team || raw.awayTeam || raw.away || "Away";
  const league = raw.league_name || raw.league || raw.competition || "";
  const matchTime = formatMatchTime(raw.match_date || raw.kickoff || raw.date);

  // Normalize market entries. The endpoint may return:
  //   { prediction: "1", market: "1X2", odds, confidence }
  //   or an array under `markets` / `predictions`
  let marketList = [];

  if (Array.isArray(raw.markets)) {
    marketList = raw.markets.map((m) => ({
      market: m.market || m.name || "1X2",
      prediction: m.prediction || m.value || m.selection || "-",
      confidence:
        typeof m.confidence === "number"
          ? m.confidence
          : parseFloat(m.confidence) || 60,
      confidenceLevel: toConfidenceLevel(m.confidence),
    }));
  } else if (raw.prediction) {
    marketList = [
      {
        market: raw.market || "1X2",
        prediction: raw.prediction,
        confidence:
          typeof raw.confidence === "number"
            ? raw.confidence
            : parseFloat(raw.confidence) || 60,
        confidenceLevel: toConfidenceLevel(raw.confidence),
      },
    ];
  }

  // If no market data, skip rendering markets (avoid empty block)
  return {
    id: raw.id || raw.fixture_id || `pred-${index}`,
    fixtureId: raw.fixture_id || raw.id,
    league,
    matchTime,
    homeTeam: home,
    awayTeam: away,
    isPremium: raw.is_premium ?? true, // your API doesn't have this; default premium
    predictions: marketList,
    analysis:
      raw.analysis ||
      raw.reasoning ||
      raw.expert_analysis ||
      "Expert analysis coming soon.",
    raw, // keep original in case you need it
  };
};

export const adaptPredictions = (list = []) =>
  list.map((p, i) => adaptPrediction(p, i));
```

> ⚠️ **You must confirm the actual JSON shape** returned by `/api/predictions/:date` from your Sporticos API. Open it in a browser: `https://sporticos-api-production.up.railway.app/api/predictions/2026-09-25` and inspect. Then adjust the field names in `adaptPrediction` accordingly. The adapter above is written defensively so it won't crash on missing fields.

---

## Step 3 — Fix the stale `date` issue in the hook

In your current `useMatchPredictions`, `date` is captured once at hook creation. If the user changes `date`, the hook won't refetch. Two options:

### Option A — Remount the hook when date changes (simplest)

Extract the predictions UI into a subcomponent and give it a `key`:

```jsx
function Tips({ showNotification, showModal }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  // ...
  return <TipsInner key={date} date={date} ... />;
}

function TipsInner({ date, ...rest }) {
  const { predictions, loading, error, fetchByDate } = useMatchPredictions({
    autoFetch: true,
    date,
  });
  // ...
}
```

### Option B — Make the hook accept dynamic params (better)

Patch `useMatchPredictions` to re-run whenever `date` or `market` change:

```js
// hooks/useMatchPredictions.js
import { useState, useCallback, useEffect } from "react";
import { useSporticosApi } from "./useSporticosApi";

export const useMatchPredictions = (options = {}) => {
  const {
    autoFetch = false,
    date = new Date().toISOString().slice(0, 10),
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

  // ... other functions unchanged ...

  // CHANGED: auto-refetch when date/market changes
  useEffect(() => {
    if (autoFetch) fetchByDate();
  }, [autoFetch, fetchByDate]);

  return {
    predictions,
    meta,
    loading,
    error,
    fetchByDate,
    fetchByMarket,
    fetchByFixture: /* ... */,
    fetchPosts: /* ... */,
    refetch: fetchByDate,
  };
};
```

With this patch, you can add a date picker and the hook refetches automatically:

```jsx
<input
  type="date"
  value={date}
  onChange={(e) => setDate(e.target.value)}
/>
```

No extra `useEffect` needed in `Tips.jsx`.

---

## Step 4 — Verify the actual API response shape first

Before trusting the adapter, open in a browser (or curl):

```bash
curl "https://sporticos-api-production.up.railway.app/api/predictions/2026-09-25" | jq
```

Then look for these fields. Update `adaptPrediction` accordingly:

| UI field needed | Look for in API response |
|---|---|
| `homeTeam` | `home_team`, `home`, `homeTeam`, `home_team_name` |
| `awayTeam` | `away_team`, `away`, `awayTeam`, `away_team_name` |
| `league` | `league_name`, `league`, `competition` |
| `matchTime` | `match_date`, `kickoff`, `date`, `start_time` |
| `predictions[]` | `markets[]`, `prediction`, `bet_type`, `tip` |
| `analysis` | `analysis`, `reasoning`, `expert_analysis`, `preview` |
| `id` | `id`, `fixture_id`, `match_id` |

Also test `/api/prediction_market/?market=full_time_result&date=2026-09-25` — its shape may differ from `/api/predictions/:date`.

---

## Summary of changes

| What | Before | After |
|---|---|---|
| Data source | `samplePredictions` hardcoded | `useMatchPredictions` hook → real API |
| Local state | `const [predictions, setPredictions] = useState([])` | Removed — hook owns it |
| Duplicate fetch | `autoFetch: true` **and** manual `useEffect` | Only `autoFetch: true` (or manual, not both) |
| Shape mismatch | UI expected `homeTeam`, API returns `home_team` | `adaptPredictions()` adapter |
| Error handling | Silent | Renders error banner with retry |
| Empty state | None | "No predictions available for {date}" |
| Stale date | Hook captured date once | Fixed via hook patch or `key={date}` remount |

After these changes, the page renders whatever your Sporticos API returns, adapted to your existing CSS classes — no other UI changes required.


Got it. Here's your file with **only the data layer fixed** — no adapter file, no error UI, no empty state. Just the duplicate `predictions` state removed, `samplePredictions` deleted, and the shape mismatch resolved inline so your existing JSX keeps working.

```jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import { useMatchPredictions } from "../hooks/useMatchPredictions";
import Joyride from "react-joyride";

// Map API confidence → UI level
const toConfidenceLevel = (confidence) => {
  if (typeof confidence === "number") {
    if (confidence >= 75) return "high";
    if (confidence >= 50) return "medium";
    return "low";
  }
  const c = String(confidence || "").toLowerCase();
  if (c.includes("high")) return "high";
  if (c.includes("low")) return "low";
  return "medium";
};

// Format ISO → "Today • 15:00 GMT"
const formatMatchTime = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    const isToday = d.toDateString() === today.toDateString();
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
    return `${isToday ? "Today" : d.toLocaleDateString("en-GB")} • ${time} GMT`;
  } catch {
    return iso;
  }
};

// Adapt raw Sporticos prediction → shape this component expects
const adaptPrediction = (raw, index = 0) => {
  const home = raw.home_team || raw.homeTeam || raw.home || "Home";
  const away = raw.away_team || raw.awayTeam || raw.away || "Away";
  const league = raw.league_name || raw.league || raw.competition || "";
  const matchTime = formatMatchTime(raw.match_date || raw.kickoff || raw.date);

  let marketList = [];

  if (Array.isArray(raw.markets)) {
    marketList = raw.markets.map((m) => ({
      market: m.market || m.name || "1X2",
      prediction: m.prediction || m.value || m.selection || "-",
      confidence:
        typeof m.confidence === "number"
          ? m.confidence
          : parseFloat(m.confidence) || 60,
      confidenceLevel: toConfidenceLevel(m.confidence),
    }));
  } else if (raw.prediction) {
    marketList = [
      {
        market: raw.market || "1X2",
        prediction: raw.prediction,
        confidence:
          typeof raw.confidence === "number"
            ? raw.confidence
            : parseFloat(raw.confidence) || 60,
        confidenceLevel: toConfidenceLevel(raw.confidence),
      },
    ];
  }

  return {
    id: raw.id || raw.fixture_id || `pred-${index}`,
    league,
    matchTime,
    homeTeam: home,
    awayTeam: away,
    isPremium: raw.is_premium ?? true,
    predictions: marketList,
    analysis:
      raw.analysis ||
      raw.reasoning ||
      raw.expert_analysis ||
      "Expert analysis coming soon.",
    raw,
  };
};

function Tips({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { user, userProfile } = useFirebase();
  const {
    subscriptions,
    loading: subsLoading,
    hasActiveSubscription,
    activeSubscription,
  } = useUserSubscriptions();

  const [runTour, setRunTour] = useState(true);
  const [unlockedCards, setUnlockedCards] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const {
    predictions: rawPredictions,
    loading,
    error,
    fetchByDate,
  } = useMatchPredictions({
    autoFetch: true,
    date,
  });

  const predictions = useMemo(
    () => (rawPredictions || []).map((p, i) => adaptPrediction(p, i)),
    [rawPredictions],
  );

  const isPageLoading = loading || subsLoading;
```

**Notes (so you can finish the rest yourself):**

1. `samplePredictions` is deleted.
2. The local `const [predictions, setPredictions] = useState([])` is removed — the hook's `predictions` is the only one now.
3. The second `useEffect` that called `fetchPredictions` with `setTimeout` is removed.
4. The `useEffect(() => { fetchByDate(); }, [date, fetchByDate])` is removed — `autoFetch: true` + the hook's `date` option already handle it (assuming your hook re-fetches on `date` change; if not, patch `useMatchPredictions` per the earlier note, or remount with `key={date}`).
5. `error` is now destructured and available for you to render however you want.
6. Everything from `const steps = [...]` downward is untouched — your JSX keeps working because the adapter produces the exact shape (`id`, `league`, `matchTime`, `homeTeam`, `awayTeam`, `isPremium`, `predictions[]`, `analysis`) your component already expects.

You'll want to adjust the field names inside `adaptPrediction` once you inspect the actual JSON from `https://sporticos-api-production.up.railway.app/api/predictions/2026-09-25`.

# Fetching Posts on Mount with `useMatchPredictions`

Since `autoFetch` only triggers `fetchByDate` (not `fetchPosts`), you need to call `fetchPosts` yourself. Here are the cleanest ways:

---

## Option 1 — Simple `useEffect` on mount (most direct)

```jsx
const { fetchPosts } = useMatchPredictions();

const [posts, setPosts] = useState([]);

useEffect(() => {
  const load = async () => {
    const data = await fetchPosts({ limit: 10, offset: 0 });
    setPosts(data?.data?.data || data?.data || []);
  };
  load();
}, []); // empty deps = mount only
```

> ⚠️ **ESLint will warn** about `fetchPosts` missing from deps. It's stable if `useMatchPredictions` wraps it in `useCallback` (like `makeRequest` in your hook does), so you can safely disable the rule:
> ```jsx
> // eslint-disable-next-line react-hooks/exhaustive-deps
> }, []);
> ```

---

## Option 2 — Include `fetchPosts` in deps (ESLint-clean)

```jsx
useEffect(() => {
  let cancelled = false;

  (async () => {
    const data = await fetchPosts({ limit: 10, offset: 0 });
    if (!cancelled) setPosts(data?.data?.data || data?.data || []);
  })();

  return () => {
    cancelled = true;
  };
}, [fetchPosts]);
```

This re-runs only if `fetchPosts`'s identity changes (which it shouldn't, since `makeRequest` is `useCallback`-wrapped and `fetchPosts` closes over it).

---

## Option 3 — If you'd rather not manage `posts` state

Have `fetchPosts` write into the hook's `data` state. Right now your hook's `makeRequest` already calls `setData(response.data)`, but the hook **returns a single `data`** shared across every method. If you call `fetchByDate` and `fetchPosts` on the same hook instance, they'll overwrite each other.

So either:

**3a — Use two hook instances:**

```jsx
const { predictions, loading: predLoading, error: predError, fetchByDate } =
  useMatchPredictions({ autoFetch: true, date });

const { data: postsData, loading: postsLoading, fetchPosts } =
  useMatchPredictions();

const posts = postsData?.data?.data || postsData?.data || [];

useEffect(() => {
  fetchPosts({ limit: 10, offset: 0 });
}, [fetchPosts]);
```

Each hook has its own `data`, `loading`, `error` — no collisions.

**3b — Keep one hook but always read from return values:**

```jsx
const { fetchPosts } = useMatchPredictions();
const [posts, setPosts] = useState([]);

useEffect(() => {
  fetchPosts({ limit: 10, offset: 0 }).then((data) => {
    setPosts(data?.data?.data || data?.data || []);
  });
}, [fetchPosts]);
```

(same as Option 1, just written with `.then`)

---

## Recommended — combine with your predictions fetch

If you want both on mount in one clean effect:

```jsx
const {
  predictions,
  loading: predLoading,
  error: predError,
  fetchByDate,
  fetchPosts,
} = useMatchPredictions({ autoFetch: false });

const [posts, setPosts] = useState([]);
const [postsLoading, setPostsLoading] = useState(false);

useEffect(() => {
  let cancelled = false;

  (async () => {
    setPostsLoading(true);
    try {
      const [_, postsData] = await Promise.all([
        fetchByDate(),          // uses hook's internal `date`
        fetchPosts({ limit: 10, offset: 0 }),
      ]);
      if (!cancelled) {
        setPosts(postsData?.data?.data || postsData?.data || []);
      }
    } finally {
      if (!cancelled) setPostsLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [fetchByDate, fetchPosts]);
```

> ⚠️ **Caveat:** `fetchByDate()` and `fetchPosts()` share the same `data`/`loading` in the hook's state — whichever resolves last wins for `data`. That's why in this pattern I read `posts` from the **return value** of `fetchPosts` rather than the hook's `data`. If you want both `data`s independently, use **two hook instances** (Option 3a).

---

## TL;DR

- `autoFetch` only drives `fetchByDate`. For posts, call `fetchPosts` yourself.
- Use `useEffect(() => { fetchPosts({...}); }, [fetchPosts])` on mount.
- Capture the return value and store it in local state (`posts`), because the hook's `data` field is shared.
- If you need independent state for both, use two `useMatchPredictions()` instances.


# Handling "League ID Set Internally on Mount"

There are two common scenarios where the league ID isn't passed in as a prop. Both need small adjustments to the `useLeague` hook.

---

## Scenario A — Fetch a list of leagues, pick one, then load it

You mount with no ID, fetch the list, then set the ID.

```jsx
import { useState, useEffect } from "react";
import { useLeague } from "../hooks/useLeague";
import { useSporticosApi } from "../hooks/useSporticosApi";

export default function LeaguePage() {
  const [leagueId, setLeagueId] = useState(null);

  // 1. Load the list of leagues (wherever that comes from)
  const { getProviders } = useSporticosApi(); // or a dedicated leagues endpoint
  const [leagues, setLeagues] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getProviders(); // adjust to your leagues source
      const list = data?.data || [];
      setLeagues(list);
      if (list[0]) setLeagueId(list[0].id); // pick a default
    })();
  }, [getProviders]);

  // 2. useLeague must tolerate `null` / `undefined` leagueId
  const { header, standings, fixtures, loading, error } = useLeague(leagueId, {
    limit: 10,
  });

  if (loading) return <p>Loading league…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <select
        value={leagueId ?? ""}
        onChange={(e) => setLeagueId(Number(e.target.value))}
      >
        {leagues.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>

      <h1>{header?.data?.name}</h1>

      <h3>Standings</h3>
      <ul>
        {standings.map((row, i) => (
          <li key={i}>
            {i + 1}. {row.team_name} — {row.points} pts
          </li>
        ))}
      </ul>

      <h3>Upcoming fixtures</h3>
      <ul>
        {(fixtures?.data?.data || []).map((f) => (
          <li key={f.id}>
            {f.home_team_name} vs {f.away_team_name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 🔧 Fix required in `useLeague`

Your current `useLeague` has `leagueId` in the `fetchLeague` deps, and `useEffect` triggers on `[leagueId, autoFetch, fetchLeague]`. That **already** re-fetches when `leagueId` changes — good. But if `leagueId` starts as `null` you'll get a pointless fetch and stale state. Add a guard:

```js
// hooks/useLeague.js
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
    if (!leagueId) return; // ✅ guard: no fetch without an ID

    const result = { header: null, table: null, fixtures: null, lastResults: null };

    await Promise.allSettled([
      getLeagueHeader(leagueId).then((d) => (result.header = d)),
      getLeagueTable(leagueId).then((d) => (result.table = d)),
      getLeagueFixtures(leagueId, { limit, offset }).then((d) => (result.fixtures = d)),
      getLeagueLastResults(leagueId).then((d) => (result.lastResults = d)),
    ]);

    setLeague(result);
  }, [leagueId, limit, offset, getLeagueHeader, getLeagueTable, getLeagueFixtures, getLeagueLastResults]);

  useEffect(() => {
    if (autoFetch && leagueId) fetchLeague(); // ✅ only fire when ID exists
  }, [leagueId, autoFetch, fetchLeague]);

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
```

**Two important fixes in that hook:**
1. `if (!leagueId) return;` at the top of `fetchLeague` — prevents firing with a null ID.
2. `if (autoFetch && leagueId)` in the effect — same guard.
3. Also: reset `result` to a fresh object each call (not `{ ...league }`) so switching leagues doesn't briefly show the *previous* league's data.

---

## Scenario B — The component *is* the source of truth (route param, slug, etc.)

You have something like `/league/:slug` and need to resolve slug → ID first.

```jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLeague } from "../hooks/useLeague";
import { useSporticosApi } from "../hooks/useSporticosApi";

export default function LeaguePageBySlug() {
  const { slug } = useParams(); // e.g. "premier-league"
  const [leagueId, setLeagueId] = useState(null);

  const { getLeagueHeader } = useSporticosApi(); // or a `getLeagueBySlug`

  // Resolve slug → ID
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // If your API doesn't have a slug endpoint yet, you'll need to
        // fetch all leagues and find by slug locally.
        const data = await getLeagueHeader(slug); // placeholder
        const id = data?.data?.id;
        if (!cancelled && id) setLeagueId(id);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, getLeagueHeader]);

  // useLeague stays the same — it just receives `null` until resolved
  const { header, standings, fixtures, loading, error } = useLeague(leagueId, {
    limit: 10,
  });

  if (!leagueId) return <p>Resolving league…</p>;
  if (loading) return <p>Loading league…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{header?.data?.name}</h1>
      {/* ...same as before... */}
    </div>
  );
}
```

The key insight: **`useLeague` doesn't care where the ID comes from.** It just needs a truthy ID to fetch. Whether that ID arrives from:

- a prop (`<LeaguePage leagueId={1} />`)
- the component's own `useState` after resolving a slug
- a route param resolved to an ID
- a context provider
- a dropdown selection

…the hook behaves identically, as long as:

1. The hook **guards** against a null/undefined/0 ID.
2. The hook **re-fetches** when the ID changes (it does — `leagueId` is in the `useCallback` and `useEffect` deps).

---

## Scenario C — Auto-pick "first" league from a fixed list inside the component

Simplest version, no async resolution:

```jsx
export default function LeaguePage({ initialLeagueId }) {
  const [leagueId, setLeagueId] = useState(initialLeagueId ?? 1);

  // Optional: if no initialLeagueId, derive one on mount
  useEffect(() => {
    if (!initialLeagueId) {
      // e.g. read from localStorage, or pick from a hardcoded list
      const stored = localStorage.getItem("preferredLeagueId");
      if (stored) setLeagueId(Number(stored));
    }
  }, [initialLeagueId]);

  const { header, standings, fixtures, loading, error } = useLeague(leagueId, {
    limit: 10,
  });

  // render...
}
```

---

## TL;DR — what to actually change

| Problem | Fix |
|---|---|
| `useLeague(null)` fires a fetch | Add `if (!leagueId) return;` inside `fetchLeague` and `if (autoFetch && leagueId)` in the effect |
| Switching league shows old data briefly | Reset `result` to a fresh object each call — don't spread `league` |
| ID comes from async resolution | Keep `leagueId` in `useState`, set it when resolved; render a "resolving…" state while it's `null` |
| ID comes from a route param | Same — resolve slug → ID in a `useEffect`, store in state, pass to hook |

**Your existing hook is almost right** — it just needs the null guard and the state reset. Everything else (dep changes, refetch on ID change) already works.