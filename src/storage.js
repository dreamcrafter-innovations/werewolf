// storage.js — Nightfall: Secret Roles AsyncStorage persistence layer
// Works identically on iOS, Android, and Web (localStorage polyfill).

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILES:         '@nightfall:profiles',
  SETTINGS:         '@nightfall:settings',
  SESSION_STATS:    '@nightfall:session_stats',
  ALLTIME_STATS:    '@nightfall:alltime_stats',
  DAILY_CHALLENGE:  '@nightfall:daily_challenge',
  BADGES:           '@nightfall:badges',
  META:             '@nightfall:meta',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ─────────────────────────────────────────────
// Profiles / Rosters
// Shape: Array<{ id, name, players: [{ id, name, avatarId }] }>
// ─────────────────────────────────────────────
export async function loadProfiles() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILES);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function saveProfiles(profiles) {
  try {
    await AsyncStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
    return true;
  } catch (_) {
    return false;
  }
}

// ─────────────────────────────────────────────
// Settings  { themeId, hapticsEnabled, narratorEnabled }
// (soundEnabled was removed — no sound assets/audio library exist yet; re-add here
// once real sound effects are wired up)
// ─────────────────────────────────────────────
export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (_) {
    return false;
  }
}

// ─────────────────────────────────────────────
// Session stats  (resets when a new game group starts)
// Shape: { roundsPlayed, playerStats: { [id]: { name, wins, losses, roundsPlayed } } }
// ─────────────────────────────────────────────
const EMPTY_SESSION = { roundsPlayed: 0, playerStats: {} };

export async function loadSessionStats() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SESSION_STATS);
    return raw ? JSON.parse(raw) : EMPTY_SESSION;
  } catch (_) {
    return EMPTY_SESSION;
  }
}

export async function saveSessionStats(stats) {
  try {
    await AsyncStorage.setItem(KEYS.SESSION_STATS, JSON.stringify(stats));
    return true;
  } catch (_) {
    return false;
  }
}

export async function clearSessionStats() {
  try {
    await AsyncStorage.removeItem(KEYS.SESSION_STATS);
    return true;
  } catch (_) {
    return false;
  }
}

// ─────────────────────────────────────────────
// All-time stats  (persists across sessions)
// ─────────────────────────────────────────────
const EMPTY_ALLTIME = { totalRounds: 0, villageWins: 0, evilWins: 0, playerStats: {} };

export async function loadAlltimeStats() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.ALLTIME_STATS);
    return raw ? JSON.parse(raw) : EMPTY_ALLTIME;
  } catch (_) {
    return EMPTY_ALLTIME;
  }
}

export async function saveAlltimeStats(stats) {
  try {
    await AsyncStorage.setItem(KEYS.ALLTIME_STATS, JSON.stringify(stats));
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Did this player win the round? The Jester is its own faction — when it wins, both
 * the village and the evil team lose, so this cannot be a simple good/evil comparison.
 */
function playerWon(player, winner) {
  const isEvil = player.role === 'VILLAIN' || player.role === 'DON';
  // Cross-faction lovers win as their own team of two, so neither side gets credit.
  if (winner === 'LOVERS') return !!player.loverId;
  if (winner === 'JESTER') return player.role === 'JESTER';
  if (player.role === 'JESTER') return false;
  return (isEvil && winner === 'VILLAIN') || (!isEvil && winner === 'VILLAGE');
}

/**
 * Record one completed round into both session and all-time stats.
 * @param {object} params
 * @param {Array}  params.players       - full player list with role, isAlive
 * @param {string} params.winner        - 'VILLAGE' | 'VILLAIN'
 * @param {string} params.villainThemeId
 */
export async function recordRoundResult({ players, winner, villainThemeId }) {
  try {
    // --- session ---
    const session = await loadSessionStats();
    session.roundsPlayed += 1;
    for (const p of players) {
      if (!p.id) continue;
      const existing = session.playerStats[p.id] ?? { name: p.name, wins: 0, losses: 0, roundsPlayed: 0, evilWins: 0 };
      const isEvil = p.role === 'VILLAIN' || p.role === 'DON';
      const won    = playerWon(p, winner);
      session.playerStats[p.id] = {
        ...existing,
        name:         p.name,
        roundsPlayed: existing.roundsPlayed + 1,
        wins:         existing.wins   + (won  ? 1 : 0),
        losses:       existing.losses + (!won ? 1 : 0),
        evilWins:     existing.evilWins + (isEvil && winner === 'VILLAIN' ? 1 : 0),
      };
    }
    await saveSessionStats(session);

    // --- all-time ---
    const alltime = await loadAlltimeStats();
    alltime.totalRounds  += 1;
    alltime.villageWins  += winner === 'VILLAGE' ? 1 : 0;
    alltime.evilWins     += winner === 'VILLAIN'  ? 1 : 0;
    // key by player.id so roster-based players accumulate correctly across sessions
    for (const p of players) {
      if (!p.id) continue;
      const key = p.id;
      const existing = alltime.playerStats[key] ?? { name: p.name, wins: 0, losses: 0, roundsPlayed: 0, evilWins: 0, lastVillain: null };
      const isEvil = p.role === 'VILLAIN' || p.role === 'DON';
      const won    = playerWon(p, winner);
      alltime.playerStats[key] = {
        ...existing,
        name:         p.name,
        roundsPlayed: existing.roundsPlayed + 1,
        wins:         existing.wins   + (won  ? 1 : 0),
        losses:       existing.losses + (!won ? 1 : 0),
        evilWins:     existing.evilWins + (isEvil && winner === 'VILLAIN' ? 1 : 0),
        lastVillain:  villainThemeId,
      };
    }
    await saveAlltimeStats(alltime);
  } catch (_) {
    // never throw — stats are non-critical
  }
}

// ─────────────────────────────────────────────
// Daily challenge  { date (YYYY-MM-DD), villainThemeId, playerCount, completed, score }
// ─────────────────────────────────────────────
export async function loadDailyChallenge() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.DAILY_CHALLENGE);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export async function saveDailyChallenge(data) {
  try {
    await AsyncStorage.setItem(KEYS.DAILY_CHALLENGE, JSON.stringify(data));
    return true;
  } catch (_) {
    return false;
  }
}

// ─────────────────────────────────────────────
// Badges  Set<badgeId> stored as string[]
// ─────────────────────────────────────────────
export async function loadEarnedBadges() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.BADGES);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (_) {
    return new Set();
  }
}

export async function awardBadge(badgeId) {
  try {
    const current = await loadEarnedBadges();
    if (current.has(badgeId)) return false; // already earned
    current.add(badgeId);
    await AsyncStorage.setItem(KEYS.BADGES, JSON.stringify([...current]));
    return true; // newly awarded
  } catch (_) {
    return false;
  }
}

const EMPTY_META = {
  gamesPlayed: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayedDate: null, // YYYY-MM-DD
  dailyCompletedCount: 0, // total Daily Challenges marked complete — drives the daily_7 badge
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayDiff(a, b) {
  const oneDay = 24 * 60 * 60 * 1000;
  const da = new Date(`${a}T00:00:00`);
  const db = new Date(`${b}T00:00:00`);
  return Math.round((db - da) / oneDay);
}

export async function loadMeta() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.META);
    return raw ? { ...EMPTY_META, ...JSON.parse(raw) } : EMPTY_META;
  } catch (_) {
    return EMPTY_META;
  }
}

export async function saveMeta(meta) {
  try {
    await AsyncStorage.setItem(KEYS.META, JSON.stringify(meta));
    return true;
  } catch (_) {
    return false;
  }
}

export async function recordGamePlayed() {
  try {
    const meta = await loadMeta();
    const today = todayKey();
    let nextStreak = meta.currentStreak || 0;

    if (!meta.lastPlayedDate) nextStreak = 1;
    else {
      const diff = dayDiff(meta.lastPlayedDate, today);
      if (diff === 1) nextStreak += 1;
      else if (diff > 1) nextStreak = 1;
    }

    const updated = {
      ...meta,
      gamesPlayed: (meta.gamesPlayed || 0) + 1,
      currentStreak: nextStreak,
      bestStreak: Math.max(meta.bestStreak || 0, nextStreak),
      lastPlayedDate: today,
    };
    await saveMeta(updated);
    return updated;
  } catch (_) {
    return null;
  }
}
