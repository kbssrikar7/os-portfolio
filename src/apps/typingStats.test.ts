import { describe, expect, it } from 'vitest';
import { computeStats } from './typingStats';

const words = ['retrieval', 'commit', 'merge', 'socket', 'system'];

describe('typing stats', () => {
  it('a single typo only costs its own word', () => {
    // "sockt" instead of "socket": everything after it is still correct.
    const s = computeStats(words, ['retrieval', 'commit', 'merge', 'sockt', 'system', ''], 60);
    expect(s.missed).toBe(1);
    expect(s.incorrect).toBe(1); // 't' typed where 'e' belongs; the final 't' counts as missed
    expect(s.correct).toBe(9 + 6 + 5 + 4 + 6);
    // Correct words + spaces: retrieval(10) commit(7) merge(6) system(7) = 30 chars = 6 wpm over a minute.
    expect(s.wpm).toBe(6);
  });

  it('counts extra characters', () => {
    const s = computeStats(words, ['retrievals', ''], 60);
    expect(s.extra).toBe(1);
    expect(s.wpm).toBe(0);
  });

  it('credits a correct prefix of the word in progress', () => {
    const s = computeStats(words, ['retrieval', 'com'], 12);
    // (10 + 3) chars / 5 / (12/60 min) = 13
    expect(s.wpm).toBe(13);
  });

  it('perfect typing gives wpm equal to raw', () => {
    const s = computeStats(words, [...words, ''], 60);
    expect(s.wpm).toBe(s.raw);
    expect(s.incorrect + s.extra + s.missed).toBe(0);
  });
});
