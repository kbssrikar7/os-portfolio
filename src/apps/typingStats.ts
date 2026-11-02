export type Sample = { sec: number; wpm: number; raw: number; errors: number };

export type Stats = { wpm: number; raw: number; correct: number; incorrect: number; extra: number; missed: number };

/**
 * Monkeytype-style grading. `typed[i]` is the input for `words[i]`; the last
 * entry is the word in progress. Net wpm counts only correctly typed words
 * (plus their spaces), and the in-progress word while it is still a correct prefix.
 */
export function computeStats(words: string[], typed: string[], seconds: number): Stats {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;
  let netChars = 0;
  let rawChars = 0;
  const last = typed.length - 1;
  typed.forEach((t, i) => {
    const w = words[i] ?? '';
    const committed = i < last;
    for (let c = 0; c < t.length; c++) {
      if (c >= w.length) extra++;
      else if (t[c] === w[c]) correct++;
      else incorrect++;
    }
    if (committed && t.length < w.length) missed += w.length - t.length;
    rawChars += t.length + (committed ? 1 : 0);
    if (committed && t === w) netChars += w.length + 1;
    if (!committed && w.startsWith(t)) netChars += t.length;
  });
  const minutes = Math.max(seconds, 1) / 60;
  return {
    wpm: Math.round(netChars / 5 / minutes),
    raw: Math.round(rawChars / 5 / minutes),
    correct,
    incorrect,
    extra,
    missed,
  };
}
