// src/utils/gameLogic.js

import { ROLES } from '../data/roles';

/**
 * Check if the game is over and who won.
 * Returns 'VILLAIN', 'VILLAGE', or null (game continues).
 */
// DON is on the evil team (and counts for win-condition parity) even though the Seer
// specifically cannot detect it — that check stays VILLAIN-only in GameContext/NightScreen.
const EVIL_ROLES = new Set(['VILLAIN', 'DON']);

// The Jester wins alone, and only by being voted out — so for the running headcount it
// is simply a body on the village side. Its victory is decided in RESOLVE_VOTE, never here.
export const NEUTRAL_ROLES = new Set(['JESTER']);

/** Which faction a role plays for. The Jester is its own team of one. */
export function getTeam(role) {
  if (EVIL_ROLES.has(role)) return 'evil';
  if (NEUTRAL_ROLES.has(role)) return 'neutral';
  return 'good';
}

/**
 * The two players Cupid bound, or null. Only counts a mutual link — a half-written
 * pair (one side pointing at someone who does not point back) is not a couple.
 */
export function getLoverPair(players) {
  const a = players.find((p) => p.loverId);
  if (!a) return null;
  const b = players.find((p) => p.id === a.loverId);
  return b && b.loverId === a.id ? [a, b] : null;
}

/** Lovers from different factions can no longer both win with their own side. */
export function isCrossTeamPair(pair) {
  return !!pair && getTeam(pair[0].role) !== getTeam(pair[1].role);
}

export function checkWinCondition(players) {
  const alive = players.filter((p) => p.isAlive);

  // Lovers bound across factions become a third team: their only path to victory is
  // outliving everyone else. This has to be tested BEFORE parity, because the classic
  // ending — one evil lover and one village lover left — would otherwise read as
  // 1 >= 1 and hand the win to evil.
  if (alive.length === 2) {
    const pair = getLoverPair(alive);
    if (pair && isCrossTeamPair(pair)) return 'LOVERS';
  }

  const aliveEvil    = alive.filter((p) => EVIL_ROLES.has(p.role));
  const aliveVillage = alive.filter((p) => !EVIL_ROLES.has(p.role));

  if (aliveEvil.length === 0) return 'VILLAGE';
  if (aliveEvil.length >= aliveVillage.length) return 'VILLAIN';
  return null;
}

/**
 * Kill a set of players and cascade Cupid's grief link.
 *
 * Every elimination in the game routes through here — night kills, votes, Hunter
 * revenge, Witch poison. Putting the lover cascade in one place is the only way it
 * stays consistent; a guard bolted onto each caller would miss whichever path is
 * added next.
 *
 * @param {Array}  players  full player list
 * @param {Array}  deaths   [{ id, reason }] — reason is 'VILLAIN' | 'VOTE' | 'HUNTER' | 'POISON' | 'GUARD'
 * @param {number} round
 * @returns {{ players: Array, deaths: Array<{id, reason}> }} deaths includes grief deaths ('LOVER')
 */
export function applyDeaths(players, deaths, round) {
  const dying = new Map();
  for (const d of deaths) {
    if (!d?.id || dying.has(d.id)) continue;
    const p = players.find((q) => q.id === d.id);
    if (p?.isAlive) dying.set(d.id, d.reason);
  }

  // Grief cascade. Lovers are a symmetric pair, so a single pass over the snapshot
  // covers every chain — a lover's lover is the original player.
  for (const id of [...dying.keys()]) {
    const p = players.find((q) => q.id === id);
    if (!p?.loverId || dying.has(p.loverId)) continue;
    const lover = players.find((q) => q.id === p.loverId);
    if (lover?.isAlive) dying.set(p.loverId, 'LOVER');
  }

  const updated = players.map((p) =>
    dying.has(p.id)
      ? { ...p, isAlive: false, deathRound: round, deathReason: dying.get(p.id) }
      : p
  );
  return {
    players: updated,
    deaths: [...dying].map(([id, reason]) => ({ id, reason })),
  };
}

/**
 * Resolve night actions: apply kill, protection, guard and potions.
 *
 * Protection precedence, strongest first:
 *   1. Witch life potion / Healer — the victim survives outright.
 *   2. Bodyguard — the victim survives, the Bodyguard dies in their place.
 * A Bodyguard guarding themselves has no one to shield, so the attack lands normally.
 *
 * Returns { killedId, savedById, guardedById, poisonedId }
 */
export function resolveNight({
  players = [],
  villainTarget,
  healerProtect,
  bodyguardProtect,
  witchSave = false,
  witchPoison = null,
}) {
  let killedId = null;
  let savedById = null;
  let guardedById = null;

  if (villainTarget) {
    if (witchSave || (healerProtect && healerProtect === villainTarget)) {
      savedById = villainTarget;
    } else if (bodyguardProtect && bodyguardProtect === villainTarget) {
      const guard = players.find((p) => p.role === 'BODYGUARD' && p.isAlive);
      if (guard && guard.id !== villainTarget) {
        killedId = guard.id;
        guardedById = villainTarget;
      } else {
        killedId = villainTarget;
      }
    } else {
      killedId = villainTarget;
    }
  }

  // The poison is wasted rather than doubled if it names someone already dying tonight.
  const poisonedId = witchPoison && witchPoison !== killedId ? witchPoison : null;

  return { killedId, savedById, guardedById, poisonedId };
}

/**
 * Vote weight for a given player.
 * - Dead players (ghost votes) count for half.
 * - The Chief's vote counts double ("Mukhiya" — vote counts double).
 * - Everyone else counts for one full vote.
 */
export function getVoteWeight(voter) {
  if (!voter) return 0;
  if (!voter.isAlive) return 0.5;
  return voter.role === 'CHIEF' ? 2 : 1;
}

/**
 * Tally votes and return the player to eliminate.
 * Returns playerId of eliminated player, or null (tie = no elimination).
 */
export function tallyVotes(votes, players, options = {}) {
  const { allowGhostVotes = false } = options;
  // votes: [{ voterId, targetId }]
  const tally = {};

  votes.forEach(({ voterId, targetId }) => {
    if (!targetId) return;
    const voter = players.find((p) => p.id === voterId);
    if (!voter) return;
    if (!voter.isAlive && !allowGhostVotes) return;

    const weight = getVoteWeight(voter);
    tally[targetId] = (tally[targetId] || 0) + weight;
  });

  if (Object.keys(tally).length === 0) return null;

  const maxVotes = Math.max(...Object.values(tally));
  const topCandidates = Object.keys(tally).filter((id) => tally[id] === maxVotes);

  // Tie = no elimination
  if (topCandidates.length > 1) return null;
  return topCandidates[0];
}

/**
 * Returns display text for vote tally.
 */
export function getVoteTally(votes, players) {
  const tally = {};
  votes.forEach(({ voterId, targetId }) => {
    if (!targetId) return;
    const voter = players.find((p) => p.id === voterId);
    if (!voter) return;
    const weight = getVoteWeight(voter);
    tally[targetId] = (tally[targetId] || 0) + weight;
  });
  return tally;
}

/**
 * Get alive villain (evil-team) players — includes the Don, who is evil but
 * undetectable by the Seer.
 */
export function getAliveVillains(players) {
  return players.filter((p) => p.isAlive && EVIL_ROLES.has(p.role));
}

/**
 * Generate the night steps based on who's alive.
 *
 * Order matters: Cupid binds before anyone can die, and the Witch acts last so the
 * narrator can tell her who was attacked before she decides whether to spend a potion.
 *
 * @param {Array}  players
 * @param {object} opts  { round, witchHealUsed, witchPoisonUsed, cupidDone }
 */
export function getNightSteps(players, opts = {}) {
  const { round = 1, witchHealUsed = false, witchPoisonUsed = false, cupidDone = false } = opts;
  const steps = ['INTRO'];
  const alive = players.filter((p) => p.isAlive);
  // Include the Don here too — if a game's plain Villains all die but the Don
  // survives, the villain "wake up and choose a target" step must still run,
  // otherwise the night phase would stall with no way to act.
  const hasVillain = alive.some((p) => EVIL_ROLES.has(p.role));
  const hasHealer = alive.some((p) => p.role === 'HEALER');
  const hasSeer = alive.some((p) => p.role === 'SEER');
  const hasBodyguard = alive.some((p) => p.role === 'BODYGUARD');
  const hasCupid = alive.some((p) => p.role === 'CUPID');
  const hasWitch = alive.some((p) => p.role === 'WITCH');

  // Cupid binds once, on the first night only — after that there is nothing to do.
  // LOVERS immediately follows: the pair has to be shown to each other, or a couple
  // that now wins as its own team has no way to know to play for it.
  if (hasCupid && round <= 1 && !cupidDone) steps.push('CUPID', 'LOVERS');
  if (hasVillain) steps.push('VILLAIN');
  if (hasBodyguard) steps.push('BODYGUARD');
  if (hasHealer) steps.push('HEALER');
  if (hasSeer) steps.push('SEER');
  // Skip a Witch with both vials spent — waking her would leak that she is out of potions.
  if (hasWitch && !(witchHealUsed && witchPoisonUsed)) steps.push('WITCH');
  steps.push('DAWN');

  return steps;
}

/**
 * Returns the ROLES data for a player.
 */
export function getRoleData(roleId) {
  return ROLES[roleId] || ROLES.VILLAGER;
}
