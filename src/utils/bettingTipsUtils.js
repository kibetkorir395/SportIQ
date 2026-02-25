// utils/bettingTipsUtils.js

// Format odds for display
export const formatOdds = (odds) => {
  const num = parseFloat(odds);
  return num >= 2 ? num.toFixed(2) : num.toFixed(2);
};

// Calculate potential payout
export const calculatePayout = (stake, odds) => {
  return (stake * parseFloat(odds)).toFixed(2);
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    won: "green",
    lost: "red",
    pending: "gray",
  };
  return colors[status] || "gray";
};

// Get confidence color
export const getConfidenceColor = (confidence) => {
  const colors = {
    high: "green",
    medium: "orange",
    low: "red",
  };
  return colors[confidence] || "gray";
};

// Filter tips by various criteria
export const filterTips = (tips, filters = {}) => {
  return tips.filter((tip) => {
    // Filter by status
    if (filters.status && tip.status !== filters.status) return false;

    // Filter by confidence
    if (filters.confidence && tip.confidence !== filters.confidence)
      return false;

    // Filter by league
    if (filters.leagueId && tip.league_id !== filters.leagueId) return false;

    // Filter by bet type
    if (filters.betType && !tip.bet_type.includes(filters.betType))
      return false;

    // Filter by user
    if (filters.userId && tip.user_id !== filters.userId) return false;

    // Filter by date range
    if (filters.startDate || filters.endDate) {
      const tipDate = new Date(tip.created_at);
      if (filters.startDate && tipDate < new Date(filters.startDate))
        return false;
      if (filters.endDate && tipDate > new Date(filters.endDate)) return false;
    }

    // Filter by odds range
    if (filters.minOdds || filters.maxOdds) {
      const odds = parseFloat(tip.odds);
      if (filters.minOdds && odds < filters.minOdds) return false;
      if (filters.maxOdds && odds > filters.maxOdds) return false;
    }

    return true;
  });
};

// Sort tips
export const sortTips = (tips, sortBy = "created_at", sortOrder = "desc") => {
  return [...tips].sort((a, b) => {
    let valueA, valueB;

    switch (sortBy) {
      case "odds":
        valueA = parseFloat(a.odds);
        valueB = parseFloat(b.odds);
        break;
      case "created_at":
        valueA = new Date(a.created_at);
        valueB = new Date(b.created_at);
        break;
      case "match_date":
        valueA = new Date(a.match_date);
        valueB = new Date(b.match_date);
        break;
      case "confidence":
        const confidenceOrder = { high: 3, medium: 2, low: 1 };
        valueA = confidenceOrder[a.confidence] || 0;
        valueB = confidenceOrder[b.confidence] || 0;
        break;
      default:
        valueA = a[sortBy];
        valueB = b[sortBy];
    }

    if (sortOrder === "asc") {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });
};

// Calculate statistics from tips
export const calculateStats = (tips) => {
  const stats = {
    total: tips.length,
    won: 0,
    lost: 0,
    pending: 0,
    averageOdds: 0,
    totalOdds: 0,
    byConfidence: { high: 0, medium: 0, low: 0 },
    byLeague: {},
    byBetType: {},
  };

  tips.forEach((tip) => {
    if (tip.status === "won") stats.won++;
    if (tip.status === "lost") stats.lost++;
    if (tip.status === "pending") stats.pending++;

    stats.totalOdds += parseFloat(tip.odds);
    stats.byConfidence[tip.confidence]++;

    // League stats
    const league = tip.league_name;
    stats.byLeague[league] = (stats.byLeague[league] || 0) + 1;

    // Bet type stats
    const betType = tip.bet_type;
    stats.byBetType[betType] = (stats.byBetType[betType] || 0) + 1;
  });

  stats.averageOdds =
    tips.length > 0 ? (stats.totalOdds / tips.length).toFixed(2) : 0;
  stats.winRate =
    tips.length > 0 ? ((stats.won / tips.length) * 100).toFixed(1) : 0;

  return stats;
};

// Format date for display
/*export const formatDate = (dateString, options = {}) => {
  const date = new Date(dateString);
  const defaultOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };

  return new Intl.DateTimeFormat("en-US", {
    ...defaultOptions,
    ...options,
  }).format(date);
};*/

// utils/bettingTipsUtils.js

// Format date for display with multiple format options
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    // Default options
    const defaultOptions = {
      dateStyle: "medium",
      timeStyle: "short",
    };

    // Merge with custom options
    const formatOptions = { ...defaultOptions, ...options };

    // Format the date
    return new Intl.DateTimeFormat("en-US", formatOptions).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

// Format date with custom patterns
/*export const formatDateCustom = (dateString, formatType = "default") => {
  if (!dateString) return "N/A";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const monthsShort = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthsFull = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  switch (formatType) {
    case "short":
      // MM/DD/YYYY HH:mm
      return `${month}/${day}/${year} ${hours}:${minutes}`;

    case "long":
      // Month Day, Year HH:MM AM/PM
      return `${monthsFull[date.getMonth()]} ${day}, ${year} ${
        date.getHours() % 12 || 12
      }:${minutes} ${date.getHours() < 12 ? "AM" : "PM"}`;

    case "match":
      // Jan 15, 8:30 PM
      return `${monthsShort[date.getMonth()]} ${day}, ${
        date.getHours() % 12 || 12
      }:${minutes} ${date.getHours() < 12 ? "AM" : "PM"}`;

    case "date-only":
      // Month Day, Year
      return `${monthsFull[date.getMonth()]} ${day}, ${year}`;

    case "time-only":
      // HH:MM AM/PM
      return `${date.getHours() % 12 || 12}:${minutes} ${
        date.getHours() < 12 ? "AM" : "PM"
      }`;

    case "relative":
      // "2 hours ago", "Yesterday", etc.
      return getRelativeTime(date);

    case "compact":
      // Today 8:30 PM or Jan 15
      return getCompactTime(date);

    default:
      // Default format
      return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
};*/

// utils/bettingTipsUtils.js

export const formatDateCustom = (dateString, formatType = "default") => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    switch (formatType) {
      case "time-only":
        // Convert to 12-hour format
        const hour12 = date.getHours() % 12 || 12;
        const ampm = date.getHours() < 12 ? "AM" : "PM";
        return `${hour12}:${minutes} ${ampm}`;

      case "match":
        // Short month, day, time
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        return `${month} ${day}, ${formatDateCustom(dateString, "time-only")}`;

      default:
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
    }
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

// Get relative time (e.g., "2 hours ago", "Yesterday")
const getRelativeTime = (date) => {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay === 0) {
    if (diffHour === 0) {
      if (diffMin === 0) {
        return "Just now";
      }
      return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
    }
    return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  } else if (diffDay === 1) {
    return "Yesterday";
  } else if (diffDay < 7) {
    return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  } else if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  } else {
    // Fall back to regular date format
    return formatDateCustom(date, "short");
  }
};

// Get compact time format
const getCompactTime = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateDay.getTime() === today.getTime()) {
    return `Today ${formatDateCustom(date, "time-only")}`;
  } else if (dateDay.getTime() === yesterday.getTime()) {
    return `Yesterday ${formatDateCustom(date, "time-only")}`;
  } else {
    return formatDateCustom(date, "match");
  }
};

// Format duration (e.g., "2h 30m")
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

// Check if date is today
export const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// Check if date is in the future
export const isFuture = (dateString) => {
  return new Date(dateString) > new Date();
};

// Get time remaining until date
export const getTimeRemaining = (dateString) => {
  const futureDate = new Date(dateString);
  const now = new Date();
  const diffMs = futureDate - now;

  if (diffMs <= 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
};
