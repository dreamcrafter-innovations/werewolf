// src/data/roles.js

export const ROLES = {
  VILLAIN: {
    id: 'VILLAIN',
    name: 'Evil One',
    emoji: '👿',
    team: 'evil',
    color: '#C0392B',
    bgColor: '#1A0000',
    hint: 'Kills one player each night',
    tagline: 'Hunter of the night... enemy of the village!',
    description:
      'You are the Evil One! Every night you secretly eliminate a villager. ' +
      'Stay calm during the day — blend in and point fingers at others!',
    secretNote: 'Your fellow Evil Ones are your allies 🤝',
    nightAction: true,
    nightActionLabel: 'Choose your target',
  },
  VILLAGER: {
    id: 'VILLAGER',
    name: 'Villager',
    emoji: '🧑‍🌾',
    team: 'good',
    color: '#2D6A4F',
    bgColor: '#001A0B',
    hint: 'No special power — use your instincts!',
    tagline: 'An ordinary person... but truth is on your side!',
    description:
      'You are a simple Villager! No special powers — just your wits and courage. ' +
      'Figure out who the Evil Ones are and vote them out to save the village!',
    secretNote: null,
    nightAction: false,
  },
  SEER: {
    id: 'SEER',
    name: 'Seer',
    emoji: '🔮',
    team: 'good',
    color: '#7B2FBE',
    bgColor: '#0D001A',
    hint: "Peek at a player's role each night",
    tagline: 'Even in darkness, the truth is visible!',
    description:
      'You are the Seer! Each night you can peek at one player\'s true identity. ' +
      'Are they good or evil? Only you know — use it wisely!',
    secretNote: 'Never reveal you are the Seer — you will become the first target!',
    nightAction: true,
    nightActionLabel: 'Read someone\'s soul',
  },
  HEALER: {
    id: 'HEALER',
    name: 'Healer',
    emoji: '🌿',
    team: 'good',
    color: '#0077B6',
    bgColor: '#00081A',
    hint: 'Protect one player from death each night',
    tagline: 'Giver of life... enemy of death!',
    description:
      'You are the Healer! Each night you can protect one player from being eliminated. ' +
      'You can protect yourself too — but only once!',
    secretNote: 'You can protect yourself only once 💊',
    nightAction: true,
    nightActionLabel: 'Protect someone',
  },
  HUNTER: {
    id: 'HUNTER',
    name: 'Hunter',
    emoji: '🏹',
    team: 'good',
    color: '#D4A017',
    bgColor: '#1A1000',
    hint: 'Takes a player down when voted out',
    tagline: 'Even in death... the last arrow never misses!',
    description:
      'You are the Hunter! If the village votes you out, ' +
      'you take one player down with you — evil or innocent, no one is safe!',
    secretNote: 'When eliminated, do not forget your revenge 🏹',
    nightAction: false,
    specialAbility: 'REVENGE',
  },
  CHIEF: {
    id: 'CHIEF',
    name: 'Chief',
    emoji: '👑',
    team: 'good',
    color: '#FF8C00',
    bgColor: '#1A0800',
    hint: 'Double vote power in discussions',
    tagline: 'Village leader — double the power at the vote!',
    description:
      'You are the Chief! Your vote counts double during voting. ' +
      'Great responsibility — vote wisely!',
    secretNote: 'If everyone knows you are the Chief, the Evil Ones will target you first!',
    nightAction: false,
    specialAbility: 'DOUBLE_VOTE',
  },
  WITCH: {
    id: 'WITCH',
    name: 'Witch',
    emoji: '🧪',
    team: 'good',
    color: '#9B59B6',
    bgColor: '#12001A',
    hint: 'One life potion, one death potion — each used once',
    tagline: 'Two vials. Two chances. Choose well.',
    description:
      'You are the Witch! You hold two potions. The life potion can revive tonight\'s ' +
      'victim. The death potion can kill anyone you choose. Each potion works ONLY ONCE — ' +
      'the whole game. Spend them at the right moment!',
    secretNote: 'You learn who was attacked before you decide 🧪',
    nightAction: true,
    nightActionLabel: 'Use a potion',
  },
  BODYGUARD: {
    id: 'BODYGUARD',
    name: 'Bodyguard',
    emoji: '🛡️',
    team: 'good',
    color: '#5DADE2',
    bgColor: '#00101A',
    hint: 'Takes the hit for whoever you guard',
    tagline: 'They will have to go through you first.',
    description:
      'You are the Bodyguard! Each night you guard one player. If the evil ones attack ' +
      'them, YOU die instead and they live. You cannot guard the same player two nights ' +
      'in a row — and guarding yourself does nothing.',
    secretNote: 'Your shield costs your life — guard wisely 🛡️',
    nightAction: true,
    nightActionLabel: 'Guard someone',
  },
  CUPID: {
    id: 'CUPID',
    name: 'Cupid',
    emoji: '💘',
    team: 'good',
    color: '#FF6F91',
    bgColor: '#1A0010',
    hint: 'Links two players — if one dies, so does the other',
    tagline: 'Two hearts, one fate.',
    description:
      'You are Cupid! On the first night only, you secretly link two players as lovers. ' +
      'If one of them ever dies, the other dies of grief. Choose the pair carefully — ' +
      'you might bind a villager to a monster.',
    secretNote: 'You act on the FIRST night only 💘',
    nightAction: true,
    nightActionLabel: 'Link two lovers',
  },
  JESTER: {
    id: 'JESTER',
    name: 'Jester',
    emoji: '🃏',
    team: 'neutral',
    color: '#E84393',
    bgColor: '#1A0014',
    hint: 'Wins alone — by getting the village to vote you out',
    tagline: 'The joke is on all of you.',
    description:
      'You are the Jester! You do not win with the village OR the evil ones. ' +
      'You win ONLY if the village votes YOU out. Act suspicious. Be annoying. ' +
      'Get yourself lynched — and everyone else loses.',
    secretNote: 'Being killed at night does NOT count — you must be VOTED out 🃏',
    nightAction: false,
    specialAbility: 'JESTER_WIN',
  },
  DON: {
    id: 'DON',
    name: 'The Don',
    emoji: '😈',
    team: 'evil',
    color: '#8E44AD',
    bgColor: '#1A001A',
    hint: 'Appears innocent to the Seer',
    tagline: 'Evil wears an innocent face!',
    description:
      'You are the Don! You secretly work with the evil team — but if the Seer checks you, ' +
      'they will see INNOCENT. You are the ultimate deceiver. Help your allies stay hidden!',
    secretNote: 'The Seer CANNOT detect you — you always appear innocent! 🤫',
    nightAction: false,
  },
};

// Roles the player may deal by hand in the custom loadout, in display order.
// VILLAGER is excluded — it is always the filler for whatever slots are left over.
// DON is excluded — it is an upgrade applied to a VILLAIN, not a slot of its own.
export const ASSIGNABLE_ROLES = ['VILLAIN', 'SEER', 'HEALER', 'BODYGUARD', 'WITCH', 'HUNTER', 'CHIEF', 'CUPID', 'JESTER'];

const EVIL_IDS = ['VILLAIN', 'DON'];

/**
 * Total special slots a custom loadout consumes. Anything left over becomes Villagers.
 */
export function countCustomRoles(customRoles) {
  if (!customRoles) return 0;
  return ASSIGNABLE_ROLES.reduce((sum, id) => sum + Math.max(0, customRoles[id] | 0), 0);
}

/**
 * A loadout is playable when it fits inside the table, fields at least one evil —
 * a zero-evil game is an instant, unwinnable village victory — and leaves the village
 * outnumbering the evils. checkWinCondition() hands the game to evil the moment
 * evil >= village, so a loadout at or past parity is decided before anyone has played
 * a turn. The auto-scaled table already caps evils at a third of the players; a
 * hand-dealt one has to be held to the same floor.
 */
export function isCustomLoadoutValid(playerCount, customRoles) {
  if (!customRoles) return true;
  const total = countCustomRoles(customRoles);
  const evil = customRoles.VILLAIN | 0;
  return total <= playerCount && evil >= 1 && evil < playerCount - evil;
}

function buildCustomRoles(playerCount, customRoles) {
  const roles = [];
  for (const id of ASSIGNABLE_ROLES) {
    for (let i = 0; i < Math.max(0, customRoles[id] | 0); i++) roles.push(id);
  }
  // Defensive clamp — the Setup UI already blocks over-filling, but never deal more
  // roles than there are players (that would silently drop whoever is last in line).
  const out = roles.slice(0, playerCount);
  if (!out.some(r => EVIL_IDS.includes(r))) out[0] = 'VILLAIN';
  while (out.length < playerCount) out.push('VILLAGER');
  return out;
}

export function getRoleAssignment(playerCount, villainCountOverride = 0, customRoles = null) {
  if (playerCount < 4) return null;
  if (customRoles) return shuffle(buildCustomRoles(playerCount, customRoles));
  const roles = [];
  // Evil count: manual override (1–3, capped at 1/3 of players) or auto-scale
  const autoCount = playerCount >= 10 ? 3 : playerCount >= 6 ? 2 : 1;
  const evilCount = (villainCountOverride >= 1 && villainCountOverride <= 3)
    ? Math.min(villainCountOverride, Math.floor(playerCount / 3))
    : autoCount;
  for (let i = 0; i < evilCount; i++) roles.push('VILLAIN');
  // Always include Seer (Detective)
  roles.push('SEER');
  // Include Healer (Doctor) at 5+ players
  if (playerCount >= 5) roles.push('HEALER');
  // Include Hunter (last-arrow revenge) at 7+ players
  if (playerCount >= 7) roles.push('HUNTER');
  // Include Chief (double vote) at 9+ players
  if (playerCount >= 9) roles.push('CHIEF');
  // Bigger tables get the chaos roles. Thresholds are spaced so the villager count never
  // drops below ~1/3 of the table — a game of nothing but power roles has no bluffing room.
  if (playerCount >= 8)  roles.push('WITCH');
  if (playerCount >= 11) roles.push('JESTER');
  if (playerCount >= 13) roles.push('BODYGUARD');
  if (playerCount >= 14) roles.push('CUPID');
  // Fill remaining with Villagers (Citizens)
  while (roles.length < playerCount) roles.push('VILLAGER');
  const assignment = shuffle(roles);
  // At 8+ players with 2+ evil, upgrade one VILLAIN to the Don — appears innocent to the
  // Seer. Only kicks in with 2+ evil so at least one plain Villain remains detectable
  // and the night "villain wake" step never loses its only actor.
  if (playerCount >= 8 && evilCount >= 2) {
    const villainIdx = assignment.findIndex(r => r === 'VILLAIN');
    if (villainIdx !== -1) assignment[villainIdx] = 'DON';
  }
  return assignment;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getRolePreview(playerCount, villainCountOverride = 0, customRoles = null) {
  if (playerCount < 4) return [];
  const assigned = getRoleAssignment(playerCount, villainCountOverride, customRoles);
  const counts = {};
  assigned.forEach((r) => { counts[r] = (counts[r] || 0) + 1; });
  return Object.entries(counts).map(([id, count]) => ({ id, count, ...ROLES[id] }));
}

export const PROPHECIES = [
  'Something lurks in the shadows tonight... 🌑',
  'The air smells of danger... 💨',
  'One by one, the lanterns go dark... 🪔',
  'Someone among us is hiding a secret... 👁️',
  'No one will be safe tonight... 😱',
  'Listen! Footsteps approach in the dark... 👣',
  'Even the moon has hidden its face... 🌑',
  'Something is very wrong in this village... 🌫️',
  'Every mistake brings the village closer to ruin... 🌊',
  'The truth is about to surface... 🔍',
];

export function getRandomProphecy() {
  return PROPHECIES[Math.floor(Math.random() * PROPHECIES.length)];
}

export const AVATARS = [
  '👦','👧','🧒','👩','👨','🧑','👴','👵',
  '🧔','👲','👳','🧕','🕵️','👮','🧙','🧝',
  '🦸','🦹','🧚','🧜','🐉','🦁','🐯','🦊',
];

// Grouped avatar catalogue with stable numeric IDs — used by the roster / profile system.
// Each player saved in a roster stores an avatarId (number); getAvatarEmoji() resolves it.
export const AVATAR_GROUPS = [
  {
    label: 'People',
    items: [
      { id: 1,  emoji: '👦' }, { id: 2,  emoji: '👧' }, { id: 3,  emoji: '🧒' },
      { id: 4,  emoji: '👩' }, { id: 5,  emoji: '👨' }, { id: 6,  emoji: '🧑' },
      { id: 7,  emoji: '👴' }, { id: 8,  emoji: '👵' }, { id: 9,  emoji: '🧔' },
      { id: 10, emoji: '👲' }, { id: 11, emoji: '👳' }, { id: 12, emoji: '🧕' },
    ],
  },
  {
    label: 'Professions',
    items: [
      { id: 13, emoji: '🕵️' }, { id: 14, emoji: '👮' }, { id: 15, emoji: '🧑‍🌾' },
      { id: 16, emoji: '🧑‍⚕️' }, { id: 17, emoji: '🧑‍🍳' }, { id: 18, emoji: '🧑‍🏫' },
    ],
  },
  {
    label: 'Fantasy',
    items: [
      { id: 19, emoji: '🧙' }, { id: 20, emoji: '🧝' }, { id: 21, emoji: '🦸' },
      { id: 22, emoji: '🦹' }, { id: 23, emoji: '🧚' }, { id: 24, emoji: '🧜' },
      { id: 25, emoji: '👻' }, { id: 26, emoji: '💀' },
    ],
  },
  {
    label: 'Animals',
    items: [
      { id: 27, emoji: '🐺' }, { id: 28, emoji: '🦁' }, { id: 29, emoji: '🐯' },
      { id: 30, emoji: '🦊' }, { id: 31, emoji: '🐉' }, { id: 32, emoji: '🦅' },
    ],
  },
];

const _AVATAR_MAP = {};
for (const g of AVATAR_GROUPS) for (const a of g.items) _AVATAR_MAP[a.id] = a.emoji;

export function getAvatarEmoji(avatarId) {
  return _AVATAR_MAP[avatarId] ?? '🧑';
}
