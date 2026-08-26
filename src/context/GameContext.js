import React, { createContext, useContext, useReducer } from 'react';
import { getRoleAssignment } from '../data/roles';
import { applyDeaths, checkWinCondition, resolveNight, tallyVotes } from '../utils/gameLogic';
import { getTheme } from '../data/villainThemes';
import { logGameStarted } from '../utils/analytics';

const GameContext = createContext(null);

export const EMPTY_NIGHT_ACTIONS = {
  villainTarget:null, healerProtect:null, seerTarget:null, seerResult:null,
  bodyguardProtect:null, witchSave:false, witchPoison:null, cupidPair:null,
};

export const initialState = {
  villainThemeId: 'MAFIA',
  selectedThemeIds: ['MAFIA'],
  knowsAllies: true,
  villainCount: 0,
  allowGhostVotes: false,
  // null = auto-scaled distribution. An object ({ VILLAIN: 2, SEER: 1, ... }) is a
  // hand-dealt loadout from Setup and overrides the table entirely.
  customRoles: null,
  players: [],
  round: 0,
  phase: 'SETUP',
  nightActions: { ...EMPTY_NIGHT_ACTIONS },
  lastNightResult: { killedId:null, savedById:null, guardedById:null, poisonedId:null, deaths:[] },
  // Witch potions and Cupid's binding are once-per-GAME, so they live outside nightActions
  // (which is wiped every night).
  witchHealUsed: false,
  // The Healer may shield themselves once per game — promised by the role text
  // and the narrator script, so it has to be tracked like the witch's potions.
  healerSelfUsed: false,
  witchPoisonUsed: false,
  cupidDone: false,
  lastBodyguardTarget: null,
  votes: [],
  eliminatedThisVote: null,
  hunterRevenge: { hunterId:null, revengeTarget:null },
  // Display-ready recap lines, appended as the game happens: [{ round, phase, text }]
  log: [],
  winner: null,
};

// Recap lines are built where the names are still in scope. Storing rendered strings
// (rather than event objects the GameOver screen would have to re-resolve) keeps the
// recap to one map() at render time.
function nameOf(players, id) {
  return players.find(p => p.id === id)?.name ?? 'Someone';
}

export function reducer(state, action) {
  switch (action.type) {
    case 'SET_VILLAIN_THEME': {
      const theme = getTheme(action.themeId);
      return { ...state, villainThemeId: action.themeId, selectedThemeIds: [action.themeId], knowsAllies: theme.knowsAlliesDefault };
    }
    case 'TOGGLE_THEME_SELECT': {
      const id = action.themeId;
      const current = state.selectedThemeIds;
      const isSelected = current.includes(id);
      // Cannot deselect the last remaining theme
      if (isSelected && current.length === 1) return state;
      const updated = isSelected ? current.filter(t => t !== id) : [...current, id];
      // Preview the newly added theme
      const previewId = !isSelected ? id : state.villainThemeId;
      const theme = getTheme(previewId);
      return { ...state, selectedThemeIds: updated, villainThemeId: previewId, knowsAllies: theme.knowsAlliesDefault };
    }
    case 'SELECT_ALL_THEMES': {
      return { ...state, selectedThemeIds: action.themeIds };
    }
    case 'SET_KNOWS_ALLIES':
      return { ...state, knowsAllies: action.value };
    case 'SET_VILLAIN_COUNT':
      return { ...state, villainCount: action.value };
    case 'SET_ALLOW_GHOST_VOTES':
      return { ...state, allowGhostVotes: action.value };
    case 'SET_CUSTOM_ROLES':
      return { ...state, customRoles: action.value };
    case 'START_GAME': {
      const roles = getRoleAssignment(action.players.length, state.villainCount, state.customRoles);
      // Each VILLAIN player draws their own theme from the selected set (mixed-villain
      // mode). Other roles have no theme override — their flavor always comes from the
      // single active villainThemeId, since good roles aren't faction-specific.
      const themePool = (state.selectedThemeIds && state.selectedThemeIds.length) ? state.selectedThemeIds : [state.villainThemeId];
      const playersWithRoles = action.players.map((p, i) => {
        const role = roles[i];
        return {
          ...p,
          role,
          isAlive: true,
          villainThemeOverride: role === 'VILLAIN' ? themePool[Math.floor(Math.random() * themePool.length)] : null,
        };
      });
      // Preserve selectedThemeIds so multi-theme selections survive into the game
      return { ...initialState, villainThemeId: state.villainThemeId, selectedThemeIds: state.selectedThemeIds, knowsAllies: state.knowsAllies, villainCount: state.villainCount, customRoles: state.customRoles, allowGhostVotes: state.allowGhostVotes, players: playersWithRoles, phase: 'ROLE_REVEAL', round: 0 };
    }
    case 'START_NIGHT':
      return { ...state, phase: 'NIGHT', round: state.round + 1, nightActions: { ...EMPTY_NIGHT_ACTIONS }, lastNightResult: { killedId:null, savedById:null, guardedById:null, poisonedId:null, deaths:[] }, votes: [], eliminatedThisVote: null };
    case 'SET_VILLAIN_TARGET':
      return { ...state, nightActions: { ...state.nightActions, villainTarget: action.playerId } };
    case 'SET_HEALER_PROTECT':
      return { ...state, nightActions: { ...state.nightActions, healerProtect: action.playerId } };
    case 'SET_BODYGUARD_PROTECT':
      return { ...state, nightActions: { ...state.nightActions, bodyguardProtect: action.playerId } };
    case 'SET_WITCH_SAVE':
      return { ...state, nightActions: { ...state.nightActions, witchSave: !!action.value } };
    case 'SET_WITCH_POISON':
      return { ...state, nightActions: { ...state.nightActions, witchPoison: action.playerId } };
    case 'SET_CUPID_PAIR': {
      const [a, b] = action.pair ?? [];
      if (!a || !b || a === b) return state;
      // loverId lives on the player so every death path can see it — see applyDeaths().
      const players = state.players.map(p =>
        p.id === a ? { ...p, loverId: b } : p.id === b ? { ...p, loverId: a } : p
      );
      return {
        ...state,
        players,
        cupidDone: true,
        nightActions: { ...state.nightActions, cupidPair: [a, b] },
        log: [...state.log, { round: state.round, phase: 'NIGHT', text: `💘 ${nameOf(players, a)} and ${nameOf(players, b)} were bound as lovers` }],
      };
    }
    case 'SET_SEER_CHECK': {
      const target = state.players.find(p => p.id === action.playerId);
      return { ...state, nightActions: { ...state.nightActions, seerTarget: action.playerId, seerResult: target?.role === 'VILLAIN' ? 'EVIL' : 'INNOCENT' } };
    }
    case 'RESOLVE_NIGHT': {
      const { villainTarget, healerProtect, bodyguardProtect, witchSave, witchPoison } = state.nightActions;
      const res = resolveNight({ players: state.players, villainTarget, healerProtect, bodyguardProtect, witchSave, witchPoison });
      const { players: updatedPlayers, deaths } = applyDeaths(state.players, [
        { id: res.killedId,   reason: res.guardedById ? 'GUARD' : 'VILLAIN' },
        { id: res.poisonedId, reason: 'POISON' },
      ], state.round);
      const winner = checkWinCondition(updatedPlayers);

      const nm = id => nameOf(state.players, id);
      const lines = [];
      if (res.savedById)   lines.push(`🌿 ${nm(res.savedById)} was attacked and survived`);
      if (res.guardedById) lines.push(`🛡️ ${nm(res.guardedById)} was guarded — the Bodyguard took the hit`);
      for (const d of deaths) {
        if (d.reason === 'POISON')      lines.push(`🧪 ${nm(d.id)} was poisoned by the Witch`);
        else if (d.reason === 'LOVER')  lines.push(`💔 ${nm(d.id)} died of grief`);
        else                            lines.push(`🌑 ${nm(d.id)} was killed in the night`);
      }
      if (lines.length === 0) lines.push('😶‍🌫️ A quiet night — no one died');
      if (winner === 'LOVERS') lines.push('💞 Only the lovers are left — they win together');

      return {
        ...state,
        players: updatedPlayers,
        lastNightResult: { ...res, deaths },
        // Potions are single-use for the whole game, so burn them the moment they resolve.
        witchHealUsed:   state.witchHealUsed   || !!witchSave,
        witchPoisonUsed: state.witchPoisonUsed || !!witchPoison,
        healerSelfUsed:  state.healerSelfUsed
          || (!!healerProtect && healerProtect === state.players.find(p => p.role === 'HEALER')?.id),
        // The rule is "not the same target two nights running", so a night the
        // Bodyguard sat out ends the run. Carrying the old target forward left it
        // unselectable for the rest of the game.
        lastBodyguardTarget: bodyguardProtect ?? null,
        log: [...state.log, ...lines.map(text => ({ round: state.round, phase: 'NIGHT', text }))],
        phase: winner ? 'GAME_OVER' : 'DAY',
        winner,
      };
    }
    case 'CAST_VOTE': {
      const idx = state.votes.findIndex(v => v.voterId === action.voterId);
      const newVotes = idx >= 0 ? state.votes.map((v, i) => i === idx ? { voterId: action.voterId, targetId: action.targetId } : v) : [...state.votes, { voterId: action.voterId, targetId: action.targetId }];
      return { ...state, votes: newVotes };
    }
    case 'RESOLVE_VOTE': {
      const eliminated = tallyVotes(state.votes, state.players, { allowGhostVotes: state.allowGhostVotes });
      let updatedPlayers = state.players, nextPhase = 'DAY', hunterRevenge = { hunterId:null, revengeTarget:null }, winner = null;
      const lines = [];
      if (eliminated) {
        const elim = state.players.find(p => p.id === eliminated);
        const applied = applyDeaths(state.players, [{ id: eliminated, reason: 'VOTE' }], state.round);
        updatedPlayers = applied.players;
        const nm = id => nameOf(state.players, id);
        lines.push(`🗳️ ${nm(eliminated)} was voted out`);
        for (const d of applied.deaths) {
          if (d.reason === 'LOVER') lines.push(`💔 ${nm(d.id)} died of grief`);
        }
        // The Jester's whole win condition is being lynched, so it is checked here and
        // short-circuits everything else — including a Hunter-style death trigger.
        if (elim?.role === 'JESTER') {
          winner = 'JESTER';
          nextPhase = 'GAME_OVER';
          lines.push(`🃏 ${nm(eliminated)} was the Jester — and wanted this all along`);
        } else if (elim?.role === 'HUNTER') {
          nextPhase = 'HUNTER_REVENGE';
          hunterRevenge = { hunterId: eliminated, revengeTarget: null };
        } else {
          winner = checkWinCondition(updatedPlayers);
          nextPhase = winner ? 'GAME_OVER' : 'DAY';
        }
      } else {
        lines.push('🤝 The vote tied — no one was eliminated');
      }
      if (winner === 'LOVERS') lines.push('💞 Only the lovers are left — they win together');
      return {
        ...state,
        players: updatedPlayers,
        eliminatedThisVote: eliminated,
        phase: nextPhase,
        hunterRevenge,
        log: [...state.log, ...lines.map(text => ({ round: state.round, phase: 'VOTE', text }))],
        winner,
      };
    }
    case 'HUNTER_REVENGE_TARGET': {
      const { players: updatedPlayers, deaths } = applyDeaths(state.players, [{ id: action.targetId, reason: 'HUNTER' }], state.round);
      const winner = checkWinCondition(updatedPlayers);
      const nm = id => nameOf(state.players, id);
      const lines = deaths.map(d => d.reason === 'LOVER'
        ? `💔 ${nm(d.id)} died of grief`
        : `🏹 ${nm(d.id)} was taken down by the Hunter`);
      return {
        ...state,
        players: updatedPlayers,
        hunterRevenge: { ...state.hunterRevenge, revengeTarget: action.targetId },
        log: [...state.log, ...lines.map(text => ({ round: state.round, phase: 'VOTE', text }))],
        phase: winner ? 'GAME_OVER' : 'DAY',
        winner,
      };
    }
    case 'SKIP_HUNTER_REVENGE': {
      const winner = checkWinCondition(state.players);
      return { ...state, phase: winner ? 'GAME_OVER' : 'DAY', winner };
    }
    case 'RESET_GAME': {
      const tid = action.themeId || state.villainThemeId;
      return { ...initialState, villainThemeId: tid, selectedThemeIds: state.selectedThemeIds, knowsAllies: getTheme(tid).knowsAlliesDefault, villainCount: state.villainCount, customRoles: state.customRoles, allowGhostVotes: state.allowGhostVotes };
    }
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const villainTheme = getTheme(state.villainThemeId);
  const actions = {
    setVillainTheme: (id) => dispatch({ type: 'SET_VILLAIN_THEME', themeId: id }),
    toggleThemeSelect: (id) => dispatch({ type: 'TOGGLE_THEME_SELECT', themeId: id }),
    selectAllThemes: (ids) => dispatch({ type: 'SELECT_ALL_THEMES', themeIds: ids }),
    setKnowsAllies: (val) => dispatch({ type: 'SET_KNOWS_ALLIES', value: val }),
    setVillainCount: (val) => dispatch({ type: 'SET_VILLAIN_COUNT', value: val }),
    setAllowGhostVotes: (val) => dispatch({ type: 'SET_ALLOW_GHOST_VOTES', value: val }),
    setCustomRoles: (val) => dispatch({ type: 'SET_CUSTOM_ROLES', value: val }),
    startGame: (players) => { dispatch({ type: 'START_GAME', players }); logGameStarted({ playerCount: players.length, villainThemeId: state.villainThemeId }); },
    startNight: () => dispatch({ type: 'START_NIGHT' }),
    setVillainTarget: (id) => dispatch({ type: 'SET_VILLAIN_TARGET', playerId: id }),
    setHealerProtect: (id) => dispatch({ type: 'SET_HEALER_PROTECT', playerId: id }),
    setBodyguardProtect: (id) => dispatch({ type: 'SET_BODYGUARD_PROTECT', playerId: id }),
    setWitchSave: (val) => dispatch({ type: 'SET_WITCH_SAVE', value: val }),
    setWitchPoison: (id) => dispatch({ type: 'SET_WITCH_POISON', playerId: id }),
    setCupidPair: (pair) => dispatch({ type: 'SET_CUPID_PAIR', pair }),
    setSeerCheck: (id) => dispatch({ type: 'SET_SEER_CHECK', playerId: id }),
    resolveNight: () => dispatch({ type: 'RESOLVE_NIGHT' }),
    castVote: (voterId, targetId) => dispatch({ type: 'CAST_VOTE', voterId, targetId }),
    resolveVote: () => dispatch({ type: 'RESOLVE_VOTE' }),
    hunterRevengeTarget: (id) => dispatch({ type: 'HUNTER_REVENGE_TARGET', targetId: id }),
    skipHunterRevenge: () => dispatch({ type: 'SKIP_HUNTER_REVENGE' }),
    resetGame: (themeId) => dispatch({ type: 'RESET_GAME', themeId }),
  };
  return <GameContext.Provider value={{ state, villainTheme, ...actions }}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
