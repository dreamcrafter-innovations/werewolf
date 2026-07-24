import { fill } from '../../src/utils/interpolate';

describe('fill', () => {
  test('replaces a single placeholder', () => {
    expect(fill('Hello {name}!', { name: 'World' })).toBe('Hello World!');
  });

  test('replaces multiple different placeholders', () => {
    expect(fill('{greeting}, {name}!', { greeting: 'Hi', name: 'Alice' })).toBe('Hi, Alice!');
  });

  test('replaces the same placeholder multiple times', () => {
    expect(fill('{x} + {x} = 2{x}', { x: '3' })).toBe('3 + 3 = 23');
  });

  test('returns empty string for null template', () => {
    expect(fill(null, { name: 'test' })).toBe('');
  });

  test('returns empty string for undefined template', () => {
    expect(fill(undefined, { name: 'test' })).toBe('');
  });

  test('returns template unchanged when no values provided', () => {
    expect(fill('Hello {name}!')).toBe('Hello {name}!');
  });

  test('replaces missing value keys with empty string', () => {
    expect(fill('Hello {name}!', { name: undefined })).toBe('Hello !');
  });

  test('replaces null values with empty string', () => {
    expect(fill('Value: {v}', { v: null })).toBe('Value: ');
  });

  test('handles numeric values', () => {
    expect(fill('Round {n}', { n: 3 })).toBe('Round 3');
  });

  test('handles template with no placeholders', () => {
    expect(fill('No placeholders here', { x: 'y' })).toBe('No placeholders here');
  });

  test('replaces villain theme placeholder in game strings', () => {
    const result = fill('Attacked by the {villain}!', { villain: 'Werewolf' });
    expect(result).toBe('Attacked by the Werewolf!');
  });

  test('handles count placeholder', () => {
    expect(fill('Alive ({count})', { count: 5 })).toBe('Alive (5)');
  });
});
