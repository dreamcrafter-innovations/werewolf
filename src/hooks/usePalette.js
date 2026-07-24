import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

/**
 * Returns a merged color palette:
 *   ThemeContext base (structural chrome) + villain palette (game atmosphere).
 * Villain colors win on any shared keys so game screens stay fully themed.
 * Non-game screens (Settings, Leaderboard, Daily) still look correct because
 * GameContext always has the last-selected villainTheme in state.
 */
export function usePalette() {
  const { palette: basePalette }   = useTheme();
  const { villainTheme }           = useGame();
  // Merge: app theme provides tab chrome + typography; villain palette provides
  // game atmosphere (bg gradients are on villainTheme directly, not palette).
  return { ...basePalette, ...villainTheme.palette };
}

export function useRoles() {
  const { villainTheme } = useGame();
  return villainTheme.roles;
}
