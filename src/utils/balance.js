/**
 * Balance advisor for a role mix — the thing every werewolf app lets you get
 * wrong. isCustomLoadoutValid() only blocks games that are decided before the
 * first night; this says whether a *playable* mix leans to one side.
 *
 * Weights are a rule of thumb in the style tabletop moderators use (village
 * power positive, evil power negative, each extra plain villager +1). The sum
 * is a nudge, not a prediction: near zero plays fair, far from zero tends to
 * be a blowout. Tune WEIGHTS here if playtests say otherwise.
 */
export const WEIGHTS = {
  VILLAGER: 1,
  SEER: 7,
  HEALER: 4,
  WITCH: 4,
  BODYGUARD: 3,
  HUNTER: 3,
  CHIEF: 2,
  JESTER: -1, // a vote spent on the Jester can end the game for the village
  CUPID: -3, // cross-team lovers pull a villager off the village's side
  VILLAIN: -6,
  DON: -6,
};

export const BALANCED_WITHIN = 5;

/** @param {Array<{id: string, count: number}>} mix e.g. getRolePreview() output */
export function balanceOf(mix) {
  const score = mix.reduce((s, r) => s + (WEIGHTS[r.id] ?? 0) * (r.count | 0), 0);
  const lean = score > BALANCED_WITHIN ? 'village' : score < -BALANCED_WITHIN ? 'evil' : 'balanced';
  let tip = null;
  if (lean === 'village') tip = 'Leans village. Add an evil role, or swap a Seer/Healer for a Villager.';
  if (lean === 'evil') tip = 'Leans evil. Add a Healer or Bodyguard, or remove an evil role.';
  return { score, lean, tip };
}
