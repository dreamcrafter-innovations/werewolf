jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  loadSettings,
  saveSettings,
  loadSessionStats,
  saveSessionStats,
  clearSessionStats,
  loadAlltimeStats,
  saveAlltimeStats,
  recordRoundResult,
  loadDailyChallenge,
  saveDailyChallenge,
  loadEarnedBadges,
  awardBadge,
} from '../src/storage';

const SETTINGS_KEY = '@nightfall:settings';
const SESSION_KEY  = '@nightfall:session_stats';
const ALLTIME_KEY  = '@nightfall:alltime_stats';
const DAILY_KEY    = '@nightfall:daily_challenge';
const BADGES_KEY   = '@nightfall:badges';

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── loadSettings ─────────────────────────────────────────────────────────────

describe('loadSettings', () => {
  test('returns parsed settings when found', async () => {
    const settings = { themeId: 'shadow', soundEnabled: true };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(settings));
    const result = await loadSettings();
    expect(result).toEqual(settings);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SETTINGS_KEY);
  });

  test('returns null when no settings stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadSettings();
    expect(result).toBeNull();
  });

  test('returns null on AsyncStorage error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('storage error'));
    const result = await loadSettings();
    expect(result).toBeNull();
  });
});

// ─── saveSettings ─────────────────────────────────────────────────────────────

describe('saveSettings', () => {
  test('writes settings as JSON and returns true', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const settings = { themeId: 'blood_moon', soundEnabled: false };
    const result = await saveSettings(settings);
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SETTINGS_KEY, JSON.stringify(settings));
  });

  test('returns false on AsyncStorage error', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    const result = await saveSettings({ themeId: 'shadow' });
    expect(result).toBe(false);
  });
});

// ─── loadSessionStats ─────────────────────────────────────────────────────────

describe('loadSessionStats', () => {
  test('returns parsed stats when found', async () => {
    const stats = { roundsPlayed: 3, playerStats: { p1: { name: 'Alice', wins: 2, losses: 1, roundsPlayed: 3, evilWins: 0 } } };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(stats));
    const result = await loadSessionStats();
    expect(result).toEqual(stats);
  });

  test('returns default empty session when nothing stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadSessionStats();
    expect(result).toEqual({ roundsPlayed: 0, playerStats: {} });
  });

  test('returns default empty session on error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const result = await loadSessionStats();
    expect(result).toEqual({ roundsPlayed: 0, playerStats: {} });
  });
});

// ─── saveSessionStats ─────────────────────────────────────────────────────────

describe('saveSessionStats', () => {
  test('writes session stats as JSON and returns true', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const stats = { roundsPlayed: 1, playerStats: {} };
    const result = await saveSessionStats(stats);
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SESSION_KEY, JSON.stringify(stats));
  });

  test('returns false on error', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    expect(await saveSessionStats({})).toBe(false);
  });
});

// ─── clearSessionStats ────────────────────────────────────────────────────────

describe('clearSessionStats', () => {
  test('removes session stats and returns true', async () => {
    AsyncStorage.removeItem.mockResolvedValueOnce(undefined);
    const result = await clearSessionStats();
    expect(result).toBe(true);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(SESSION_KEY);
  });

  test('returns false on error', async () => {
    AsyncStorage.removeItem.mockRejectedValueOnce(new Error('fail'));
    expect(await clearSessionStats()).toBe(false);
  });
});

// ─── loadAlltimeStats ─────────────────────────────────────────────────────────

describe('loadAlltimeStats', () => {
  test('returns parsed all-time stats when found', async () => {
    const stats = { totalRounds: 20, villageWins: 12, evilWins: 8, playerStats: {} };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(stats));
    const result = await loadAlltimeStats();
    expect(result).toEqual(stats);
  });

  test('returns default empty stats when nothing stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadAlltimeStats();
    expect(result).toEqual({ totalRounds: 0, villageWins: 0, evilWins: 0, playerStats: {} });
  });

  test('returns default empty stats on error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const result = await loadAlltimeStats();
    expect(result).toEqual({ totalRounds: 0, villageWins: 0, evilWins: 0, playerStats: {} });
  });
});

// ─── saveAlltimeStats ─────────────────────────────────────────────────────────

describe('saveAlltimeStats', () => {
  test('writes all-time stats as JSON and returns true', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const stats = { totalRounds: 5, villageWins: 3, evilWins: 2, playerStats: {} };
    const result = await saveAlltimeStats(stats);
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(ALLTIME_KEY, JSON.stringify(stats));
  });

  test('returns false on error', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    expect(await saveAlltimeStats({})).toBe(false);
  });
});

// ─── recordRoundResult ────────────────────────────────────────────────────────

describe('recordRoundResult', () => {
  const makePlayers = (roles) =>
    roles.map((role, i) => ({ id: String(i), name: `Player${i}`, role }));

  test('updates session and all-time stats for a village win', async () => {
    const emptySession = { roundsPlayed: 0, playerStats: {} };
    const emptyAlltime = { totalRounds: 0, villageWins: 0, evilWins: 0, playerStats: {} };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(emptySession))  // loadSessionStats
      .mockResolvedValueOnce(JSON.stringify(emptyAlltime)); // loadAlltimeStats
    AsyncStorage.setItem.mockResolvedValue(undefined);

    const players = makePlayers(['VILLAGER', 'VILLAIN']);
    await recordRoundResult({ players, winner: 'VILLAGE', villainThemeId: 'BHEDIYA' });

    // setItem called twice: session + alltime
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    const sessionCall = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
    expect(sessionCall.roundsPlayed).toBe(1);

    const alltimeCall = JSON.parse(AsyncStorage.setItem.mock.calls[1][1]);
    expect(alltimeCall.totalRounds).toBe(1);
    expect(alltimeCall.villageWins).toBe(1);
    expect(alltimeCall.evilWins).toBe(0);
  });

  test('increments evilWins for an evil win', async () => {
    const emptySession = { roundsPlayed: 0, playerStats: {} };
    const emptyAlltime = { totalRounds: 0, villageWins: 0, evilWins: 0, playerStats: {} };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(emptySession))
      .mockResolvedValueOnce(JSON.stringify(emptyAlltime));
    AsyncStorage.setItem.mockResolvedValue(undefined);

    const players = makePlayers(['VILLAIN', 'VILLAGER']);
    await recordRoundResult({ players, winner: 'VILLAIN', villainThemeId: 'FREDDY' });

    const alltimeCall = JSON.parse(AsyncStorage.setItem.mock.calls[1][1]);
    expect(alltimeCall.evilWins).toBe(1);
    expect(alltimeCall.villageWins).toBe(0);
  });

  test('skips players without id in session stats', async () => {
    const emptySession = { roundsPlayed: 0, playerStats: {} };
    const emptyAlltime = { totalRounds: 0, villageWins: 0, evilWins: 0, playerStats: {} };
    AsyncStorage.getItem
      .mockResolvedValueOnce(JSON.stringify(emptySession))
      .mockResolvedValueOnce(JSON.stringify(emptyAlltime));
    AsyncStorage.setItem.mockResolvedValue(undefined);

    // player without id
    const players = [{ id: null, name: 'Ghost', role: 'VILLAGER' }];
    await recordRoundResult({ players, winner: 'VILLAGE', villainThemeId: 'BHEDIYA' });

    const sessionCall = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
    expect(Object.keys(sessionCall.playerStats)).toHaveLength(0);
  });

  test('does not throw on storage error', async () => {
    AsyncStorage.getItem.mockRejectedValue(new Error('fail'));
    // Should not throw
    await expect(
      recordRoundResult({ players: [], winner: 'VILLAGE', villainThemeId: 'BHEDIYA' })
    ).resolves.toBeUndefined();
  });
});

// ─── loadDailyChallenge ───────────────────────────────────────────────────────

describe('loadDailyChallenge', () => {
  test('returns parsed daily challenge when found', async () => {
    const challenge = { date: '2026-04-29', villainThemeId: 'ZOMBIE', completed: false };
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(challenge));
    const result = await loadDailyChallenge();
    expect(result).toEqual(challenge);
  });

  test('returns null when nothing stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    expect(await loadDailyChallenge()).toBeNull();
  });

  test('returns null on error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    expect(await loadDailyChallenge()).toBeNull();
  });
});

// ─── saveDailyChallenge ───────────────────────────────────────────────────────

describe('saveDailyChallenge', () => {
  test('writes daily challenge as JSON and returns true', async () => {
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);
    const data = { date: '2026-04-29', villainThemeId: 'ZOMBIE', completed: true };
    const result = await saveDailyChallenge(data);
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(DAILY_KEY, JSON.stringify(data));
  });

  test('returns false on error', async () => {
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    expect(await saveDailyChallenge({})).toBe(false);
  });
});

// ─── loadEarnedBadges ─────────────────────────────────────────────────────────

describe('loadEarnedBadges', () => {
  test('returns a Set of badge ids when found', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['first_game', 'rounds_10']));
    const result = await loadEarnedBadges();
    expect(result instanceof Set).toBe(true);
    expect(result.has('first_game')).toBe(true);
    expect(result.has('rounds_10')).toBe(true);
  });

  test('returns empty Set when nothing stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await loadEarnedBadges();
    expect(result instanceof Set).toBe(true);
    expect(result.size).toBe(0);
  });

  test('returns empty Set on error', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('fail'));
    const result = await loadEarnedBadges();
    expect(result instanceof Set).toBe(true);
    expect(result.size).toBe(0);
  });
});

// ─── awardBadge ───────────────────────────────────────────────────────────────

describe('awardBadge', () => {
  test('awards a new badge and returns true', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['first_game']));
    AsyncStorage.setItem.mockResolvedValueOnce(undefined);

    const result = await awardBadge('rounds_10');
    expect(result).toBe(true);
    const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
    expect(savedData).toContain('rounds_10');
    expect(savedData).toContain('first_game');
  });

  test('returns false when badge already earned', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['first_game']));
    const result = await awardBadge('first_game');
    expect(result).toBe(false);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  test('returns false when setItem throws during award', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
    AsyncStorage.setItem.mockRejectedValueOnce(new Error('fail'));
    const result = await awardBadge('first_game');
    expect(result).toBe(false);
  });
});
