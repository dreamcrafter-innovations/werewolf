import React, { createContext, useContext, useReducer } from 'react';
import { getRoleAssignment } from '../data/roles';
import { checkWinCondition, resolveNight, tallyVotes } from '../utils/gameLogic';
import { getTheme } from '../data/villainThemes';
import { logGameStarted } from '../utils/analytics';

const GameContext = createContext(null);

export const initialState = {
  villainThemeId: 'MAFIA',
  selectedThemeIds: ['MAFIA'],
  knowsAllies: true,
  villainCount: 0,
  allowGhostVotes: false,
  players: [],
  round: 0,
  phase: 'SETUP',
  nightActions: { villainTarget:null, healerProtect:null, seerTarget:null, seerResult:null },
  lastNightResult: { killedId:null, savedById:null },
  votes: [],
  eliminatedThisVote: null,
  hunterRevenge: { hunterId:null, revengeTarget:null },
  winner: null,
};

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
    case 'START_GAME': {
      const roles = getRoleAssignment(action.players.length, state.villainCount);
      const playersWithRoles = action.players.map((p, i) => ({ ...p, role: roles[i], isAlive: true }));
      // Preserve selectedThemeIds so multi-theme selections survive into the game
      return { ...initialState, villainThemeId: state.villainThemeId, selectedThemeIds: state.selectedThemeIds, knowsAllies: state.knowsAllies, villainCount: state.villainCount, allowGhostVotes: state.allowGhostVotes, players: playersWithRoles, phase: 'ROLE_REVEAL', round: 0 };
    }
    case 'START_NIGHT':
      return { ...state, phase: 'NIGHT', round: state.round + 1, nightActions: { villainTarget:null, healerProtect:null, seerTarget:null, seerResult:null }, lastNightResult: { killedId:null, savedById:null }, votes: [], eliminatedThisVote: null };
    case 'SET_VILLAIN_TARGET':
      return { ...state, nightActions: { ...state.nightActions, villainTarget: action.playerId } };
    case 'SET_HEALER_PROTECT':
      return { ...state, nightActions: { ...state.nightActions, healerProtect: action.playerId } };
    case 'SET_SEER_CHECK': {
      const target = state.players.find(p => p.id === action.playerId);
      return { ...state, nightActions: { ...state.nightActions, seerTarget: action.playerId, seerResult: target?.role === 'VILLAIN' ? 'EVIL' : 'INNOCENT' } };
    }
    case 'RESOLVE_NIGHT': {
      const { killedId, savedById } = resolveNight({ players: state.players, villainTarget: state.nightActions.villainTarget, healerProtect: state.nightActions.healerProtect });
      const updatedPlayers = killedId ? state.players.map(p => p.id === killedId ? { ...p, isAlive: false, deathRound: state.round, deathReason: 'VILLAIN' } : p) : state.players;
      const winner = checkWinCondition(updatedPlayers);
      return { ...state, players: updatedPlayers, lastNightResult: { killedId, savedById }, phase: winner ? 'GAME_OVER' : 'DAY', winner };
    }
    case 'CAST_VOTE': {
      const idx = state.votes.findIndex(v => v.voterId === action.voterId);
      const newVotes = idx >= 0 ? state.votes.map((v, i) => i === idx ? { voterId: action.voterId, targetId: action.targetId } : v) : [...state.votes, { voterId: action.voterId, targetId: action.targetId }];
      return { ...state, votes: newVotes };
    }
    case 'RESOLVE_VOTE': {
      const eliminated = tallyVotes(state.votes, state.players, { allowGhostVotes: state.allowGhostVotes });
      let updatedPlayers = state.players, nextPhase = 'DAY', hunterRevenge = { hunterId:null, revengeTarget:null }, winner = null;
      if (eliminated) {
        updatedPlayers = state.players.map(p => p.id === eliminated ? { ...p, isAlive: false, deathRound: state.round, deathReason: 'VOTE' } : p);
        const elim = state.players.find(p => p.id === eliminated);
        if (elim?.role === 'HUNTER') { nextPhase = 'HUNTER_REVENGE'; hunterRevenge = { hunterId: eliminated, revengeTarget: null }; }
        else { winner = checkWinCondition(updatedPlayers); nextPhase = winner ? 'GAME_OVER' : 'DAY'; }
      }
      return { ...state, players: updatedPlayers, eliminatedThisVote: eliminated, phase: nextPhase, hunterRevenge, winner };
    }
    case 'HUNTER_REVENGE_TARGET': {
      const updatedPlayers = state.players.map(p => p.id === action.targetId ? { ...p, isAlive: false, deathRound: state.round, deathReason: 'HUNTER' } : p);
      const winner = checkWinCondition(updatedPlayers);
      return { ...state, players: updatedPlayers, hunterRevenge: { ...state.hunterRevenge, revengeTarget: action.targetId }, phase: winner ? 'GAME_OVER' : 'DAY', winner };
    }
    case 'SKIP_HUNTER_REVENGE': {
      const winner = checkWinCondition(state.players);
      return { ...state, phase: winner ? 'GAME_OVER' : 'DAY', winner };
    }
    case 'RESET_GAME': {
      const tid = action.themeId || state.villainThemeId;
      return { ...initialState, villainThemeId: tid, selectedThemeIds: state.selectedThemeIds, knowsAllies: getTheme(tid).knowsAlliesDefault, villainCount: state.villainCount, allowGhostVotes: state.allowGhostVotes };
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
    startGame: (players) => { dispatch({ type: 'START_GAME', players }); logGameStarted({ playerCount: players.length, villainThemeId: state.villainThemeId }); },
    startNight: () => dispatch({ type: 'START_NIGHT' }),
    setVillainTarget: (id) => dispatch({ type: 'SET_VILLAIN_TARGET', playerId: id }),
    setHealerProtect: (id) => dispatch({ type: 'SET_HEALER_PROTECT', playerId: id }),
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
