import { balanceOf, WEIGHTS } from '../../src/utils/balance';
import { ROLES } from '../../src/data/roles';

describe('balanceOf', () => {
  it('has a weight for every role in the game', () => {
    for (const id of Object.keys(ROLES)) expect(WEIGHTS[id]).toBeDefined();
  });

  it('sums weights by count and grades the lean', () => {
    // 8 players: 2 villains, seer, healer, 4 villagers -> -12 + 7 + 4 + 4 = 3 (balanced)
    expect(
      balanceOf([
        { id: 'VILLAIN', count: 2 },
        { id: 'SEER', count: 1 },
        { id: 'HEALER', count: 1 },
        { id: 'VILLAGER', count: 4 },
      ])
    ).toMatchObject({ score: 3, lean: 'balanced', tip: null });
    // 1 villain vs seer + healer + witch + 5 villagers -> -6 + 7 + 4 + 4 + 5 = 14
    expect(
      balanceOf([
        { id: 'VILLAIN', count: 1 },
        { id: 'SEER', count: 1 },
        { id: 'HEALER', count: 1 },
        { id: 'WITCH', count: 1 },
        { id: 'VILLAGER', count: 5 },
      ]).lean
    ).toBe('village');
    expect(balanceOf([{ id: 'VILLAIN', count: 3 }, { id: 'VILLAGER', count: 5 }]).lean).toBe('evil');
  });
});
