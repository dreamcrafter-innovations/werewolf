// src/utils/gameLogic.js

import { ROLES } from '../data/roles';

/**
 * Check if the game is over and who won.
 * Returns 'VILLAIN', 'VILLAGE', or null (game continues).
 */
const EVIL_ROLES = new Set(['VILLAIN']);

export function checkWinCondition(players) {
  const alive = players.filter((p) => p.isAlive);
  const aliveEvil    = alive.filter((p) => EVIL_ROLES.has(p.role));
  const aliveVillage = alive.filter((p) => !EVIL_ROLES.has(p.role));

  if (aliveEvil.length === 0) return 'VILLAGE';
  if (aliveEvil.length >= aliveVillage.length) return 'VILLAIN';
  return null;
}

/**
 * Resolve night actions: apply kill and protection.
 * Returns { killedId, savedById, seerResult }
 */
export function resolveNight({ players, villainTarget, healerProtect }) {
  let killedId = null;
  let savedById = null;

  if (villainTarget) {
    if (healerProtect && healerProtect === villainTarget) {
      // Protected! No kill
      savedById = healerProtect;
    } else {
      killedId = villainTarget;
    }
  }

  return { killedId, savedById };
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
 * Get alive villain players.
 */
export function getAliveVillains(players) {
  return players.filter((p) => p.isAlive && p.role === 'VILLAIN');
}

/**
 * Generate the night steps based on who's alive.
 */
export function getNightSteps(players) {
  const steps = ['INTRO'];
  const alive = players.filter((p) => p.isAlive);
  const hasVillain = alive.some((p) => p.role === 'VILLAIN');
  const hasHealer = alive.some((p) => p.role === 'HEALER');
  const hasSeer = alive.some((p) => p.role === 'SEER');

  if (hasVillain) steps.push('VILLAIN');
  if (hasHealer) steps.push('HEALER');
  if (hasSeer) steps.push('SEER');
  steps.push('DAWN');

  return steps;
}

/**
 * Returns the ROLES data for a player.
 */
export function getRoleData(roleId) {
  return ROLES[roleId] || ROLES.VILLAGER;
}
