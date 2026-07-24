// Bhoot Gaon badge definitions.
// Keep to 10 badges for launch — meaningful, achievable, role-diverse.

export const BADGES = [
  {
    id:          'first_game',
    name:        'Village Awakens',
    emoji:       '🪔',
    description: 'Play your very first round.',
  },
  {
    id:          'village_win_1',
    name:        'Light Prevails',
    emoji:       '🌅',
    description: 'Win as a villager for the first time.',
  },
  {
    id:          'evil_win_1',
    name:        'Darkness Reigns',
    emoji:       '🌑',
    description: 'Win as the evil team for the first time.',
  },
  {
    id:          'village_win_5',
    name:        'Protector of the Village',
    emoji:       '🛡️',
    description: 'Win 5 rounds on the village side.',
  },
  {
    id:          'evil_win_5',
    name:        'Evil Mastermind',
    emoji:       '👿',
    description: 'Win 5 rounds on the evil side.',
  },
  {
    id:          'rounds_10',
    name:        'Night Owl',
    emoji:       '🦉',
    description: 'Survive 10 rounds total.',
  },
  {
    id:          'daily_1',
    name:        'Daily Devotee',
    emoji:       '📅',
    description: 'Complete your first Daily Challenge.',
  },
  {
    id:          'daily_7',
    name:        'Seven Nights',
    emoji:       '🌙',
    description: 'Complete 7 Daily Challenges.',
  },
  {
    id:          'big_game',
    name:        'Grand Assembly',
    emoji:       '🏟️',
    description: 'Play a game with 10 or more players.',
  },
  {
    id:          'howtoplay',
    name:        'Student of the Dark Arts',
    emoji:       '📖',
    description: 'Read the How to Play guide fully.',
  },
];

/**
 * Evaluates which badges are newly earned after a round.
 * @param {object} params
 * @param {Array}  params.players       - full player list
 * @param {string} params.winner        - 'VILLAGE' | 'VILLAIN'
 * @param {object} params.alltimeStats  - loaded all-time stats
 * @param {Set}    params.earnedBadges  - currently earned badge ids
 * @returns {string[]} list of newly earned badge ids
 */
export function evaluateBadges({ players, winner, alltimeStats, earnedBadges }) {
  const newBadges = [];
  const check = (id, condition) => {
    if (condition && !earnedBadges.has(id)) newBadges.push(id);
  };

  const totalRounds     = alltimeStats?.totalRounds ?? 0;
  const villageWins     = alltimeStats?.villageWins ?? 0;
  const evilWins        = alltimeStats?.evilWins ?? 0;
  const playerCount     = players.length;

  check('first_game',    totalRounds >= 1);
  check('village_win_1', winner === 'VILLAGE');
  check('evil_win_1',    winner === 'VILLAIN' || winner === 'EVIL');
  check('village_win_5', villageWins >= 5);
  check('evil_win_5',    evilWins >= 5);
  check('rounds_10',     totalRounds >= 10);
  check('big_game',      playerCount >= 10);

  return newBadges;
}
