// themeParticles.js
// Emoji particle sets for each villain theme.
// killParticles   — used when villain claims a victim (DayScreen, ambient + burst)
// caughtParticles — used when villain is caught / village wins (GameOverScreen celebrate)

export const THEME_PARTICLES = {
  VILLAIN:   { kill: ['👿','💀','🌑','😈','🔥'],       caught: ['⭐','🎉','✨','💫','🌟','🎊'] },
  BHEDIYA:  { kill: ['🐺','🌕','🩸','🌲','🌑'],       caught: ['🌟','🎉','🌾','✨','💫','🏆'] },
  VAMPIR:   { kill: ['🧛','🦇','🩸','🌑','🌹'],       caught: ['⭐','✝️','🌟','🎉','💫','🌅'] },
  SHER:     { kill: ['🦁','🐾','🩸','🌿','🌑'],       caught: ['🌟','🎉','🌾','✨','🏆','💫'] },
  ZOMBIE:   { kill: ['🧟','🧠','💀','☠️','💉'],       caught: ['🌟','🎉','💊','✨','🏆','🌿'] },
  FREDDY:   { kill: ['🪚','😴','💤','💀','🛏️'],       caught: ['⭐','☀️','🌟','🎉','💫','✨'] },
  JASON:    { kill: ['🔪','🏕️','😨','💀','🌑'],       caught: ['⭐','🌟','🎉','💫','🏆','🌅'] },
  DAYAN:    { kill: ['🧙','🔮','🌙','⚡','💜'],       caught: ['⭐','🌟','🎉','✨','💫','🌸'] },
  HINDI:    { kill: ['😈','🔥','💀','🌑','👺'],       caught: ['🌟','🎉','🪔','✨','💫','⭐'] },
  TAMIL:    { kill: ['👻','💀','🌑','🕯️','🔥'],       caught: ['🌟','🎉','🪔','✨','💫','⭐'] },
  TELUGU:   { kill: ['🧟','👁️','💀','🌑','🔥'],       caught: ['🌟','🎉','✨','💫','⭐','🪔'] },
  JIANGSHI: { kill: ['🧟','🏮','💀','🩸','🌑'],       caught: ['🏮','🌟','🎉','✨','💫','⭐'] },
  GUMIHO:   { kill: ['🦊','✨','💫','🌕','🌸'],       caught: ['🌟','🎉','✨','💫','⭐','🌸'] },
  BANSHEE:  { kill: ['👻','🌫️','💀','🌙','🌊'],       caught: ['🌟','🎉','✨','💫','⭐','🍀'] },
  LLORONA:  { kill: ['😭','💧','🌊','👻','🌙'],       caught: ['🌟','🎉','✨','💫','⭐','🌺'] },
  MAFIA:    { kill: ['🤵','💀','🌃','🔫','🌑'],       caught: ['⚖️','🌟','🎉','✨','💫','🏆'] },
};

export const VILLAGE_WIN_PARTICLES  = ['⭐','🌟','🎉','✨','🏆','🎊','💫','🥳','🌾'];
export const KILL_BURST_PARTICLES   = ['💀','🌑','⚰️','😱'];
export const SAVE_BURST_PARTICLES   = ['🌿','💚','✨','🌟','💫','🍀'];
export const QUIET_NIGHT_PARTICLES  = ['🌑','😶','💤','🌌','⭐'];

export function getKillParticles(themeId) {
  return THEME_PARTICLES[themeId]?.kill ?? KILL_BURST_PARTICLES;
}

export function getCaughtParticles(themeId) {
  return THEME_PARTICLES[themeId]?.caught ?? VILLAGE_WIN_PARTICLES;
}
