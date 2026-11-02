import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '../data/profile';
import { HeaderBar } from '../shell/HeaderBar';
import { useWin } from '../shell/winContext';
import { Sym } from '../icons/Sym';
import { computeStats, type Sample } from './typingStats';
import { TypingChart } from './TypingChart';

const WORDS = 'the quick system ships code that runs on real hardware and stays correct when the network drops while models answer with sources and every deploy is a pipeline not a ritual rust python typescript kernel fleet retrieval latency limiter firmware vector index schema test build release merge refactor commit docker cluster sensor packet buffer thread async query render shader cache socket token prompt embed parse stream'.split(' ');
const DURATIONS = [15, 30, 60];
const MAX_EXTRA = 8;

function makeWords(n = 220) {
  const out: string[] = [];
  while (out.length < n) {
    const w = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (w !== out[out.length - 1]) out.push(w);
  }
  return out;
}

/**
 * Word-based typing test in the style of monkeytype: space commits a word, a
 * typo only affects its own word, and the result is graded per word.
 */
export function Typing() {
  const { focused } = useWin();
  const [dur, setDur] = useState(30);
  const [words, setWords] = useState(makeWords);
  // typed[i] is what was typed for words[i]; the last entry is the active word.
  const [typed, setTyped] = useState<string[]>(['']);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [keys, setKeys] = useState({ ok: 0, bad: 0 });
  const [samples, setSamples] = useState<Sample[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  // Per-second counters, read by the timer.
  const tick = useRef({ chars: 0, errors: 0 });
  const live = useRef({ typed, words });
  useLayoutEffect(() => {
    live.current = { typed, words };
  });

  const reset = useCallback((d?: number) => {
    if (d) setDur(d);
    setWords(makeWords());
    setTyped(['']);
    setStarted(false);
    setElapsed(0);
    setDone(false);
    setKeys({ ok: 0, bad: 0 });
    setSamples([]);
    tick.current = { chars: 0, errors: 0 };
    secs.current = 0;
    window.setTimeout(() => box.current?.focus({ preventScroll: true }), 0);
  }, []);

  // One tick per second: record a sample, end the test on time. Side effects stay
  // out of state updaters (React may call those twice), so each second is
  // sampled exactly once.
  const secs = useRef(0);
  useEffect(() => {
    if (!started || done) return;
    const t = window.setInterval(() => {
      const sec = ++secs.current;
      const { typed: tw, words: ww } = live.current;
      const sample: Sample = { sec, wpm: computeStats(ww, tw, sec).wpm, raw: Math.round((tick.current.chars / 5) * 60), errors: tick.current.errors };
      tick.current = { chars: 0, errors: 0 };
      setSamples((s) => [...s, sample]);
      setElapsed(sec);
      if (sec >= dur) setDone(true);
    }, 1000);
    return () => window.clearInterval(t);
  }, [started, done, dur]);

  useEffect(() => {
    if (focused && !done) box.current?.focus({ preventScroll: true });
  }, [focused, done]);

  // Keep the caret on the second visible line.
  useLayoutEffect(() => {
    const word = inner.current?.querySelector<HTMLElement>('.caret, .caret-end')?.closest<HTMLElement>('.ty-word');
    if (!word || !inner.current) return;
    inner.current.style.transform = `translateY(${-Math.max(0, word.offsetTop - word.offsetHeight)}px)`;
  });

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') { e.preventDefault(); reset(); return; }
    if (done || e.metaKey || e.altKey) return;
    const cur = typed.length - 1;
    const target = words[cur];
    const word = typed[cur];

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (e.ctrlKey) { setTyped([...typed.slice(0, cur), '']); return; }
      if (word.length) setTyped([...typed.slice(0, cur), word.slice(0, -1)]);
      // Like monkeytype: you may step back into the previous word only if it has a mistake.
      else if (cur > 0 && typed[cur - 1] !== words[cur - 1]) setTyped(typed.slice(0, cur));
      return;
    }
    if (e.ctrlKey || e.key.length !== 1) return;
    e.preventDefault();
    if (!started) setStarted(true);

    if (e.key === ' ') {
      if (!word.length) return;
      const ok = word === target;
      tick.current.chars += 1;
      if (!ok) tick.current.errors += 1;
      setKeys((k) => (ok ? { ...k, ok: k.ok + 1 } : { ...k, bad: k.bad + 1 }));
      setTyped([...typed, '']);
      return;
    }
    if (word.length >= target.length + MAX_EXTRA) return;
    const ok = e.key === target[word.length];
    tick.current.chars += 1;
    if (!ok) tick.current.errors += 1;
    setKeys((k) => (ok ? { ...k, ok: k.ok + 1 } : { ...k, bad: k.bad + 1 }));
    setTyped([...typed.slice(0, cur), word + e.key]);
  };

  const stats = computeStats(words, typed, Math.max(elapsed, 1));
  const acc = keys.ok + keys.bad ? Math.round((keys.ok / (keys.ok + keys.bad)) * 100) : 100;
  const raws = samples.map((s) => s.raw);
  const mean = raws.reduce((a, b) => a + b, 0) / (raws.length || 1);
  const sd = Math.sqrt(raws.reduce((a, b) => a + (b - mean) ** 2, 0) / (raws.length || 1));
  const consistency = mean ? Math.max(0, Math.round(100 * (1 - sd / mean))) : 0;
  const cur = typed.length - 1;

  return (
    <div className="typing">
      <HeaderBar
        title={
          <div className="seg" data-no-drag role="tablist" aria-label="Test length">
            {DURATIONS.map((d) => (
              <button key={d} role="tab" aria-selected={dur === d} className={dur === d ? 'on' : ''} onClick={() => reset(d)}>{d}s</button>
            ))}
          </div>
        }
        end={<button className="hb-icon" aria-label="Restart test" title="Restart (Tab)" onClick={() => reset()}><Sym name="refresh" /></button>}
      />

      {done ? (
        <div className="ty-result scroll" tabIndex={-1} onKeyDown={onKey} ref={(n) => n?.focus({ preventScroll: true })}>
          <div className="ty-top">
            <div className="ty-hero">
              <div><small>wpm</small><span>{stats.wpm}</span></div>
              <div><small>acc</small><span>{acc}%</span></div>
            </div>
            <TypingChart samples={samples} dur={dur} />
          </div>
          <dl className="ty-stats-row">
            <div><dt>test type</dt><dd>time {dur}</dd></div>
            <div><dt>raw</dt><dd>{stats.raw}</dd></div>
            <div title="correct / incorrect / extra / missed">
              <dt>characters</dt>
              <dd>{stats.correct}/{stats.incorrect}/{stats.extra}/{stats.missed}</dd>
            </div>
            <div><dt>consistency</dt><dd>{consistency}%</dd></div>
            <div><dt>time</dt><dd>{dur}s</dd></div>
          </dl>
          <div className="ty-actions">
            <button className="ty-again" onClick={() => reset()}><Sym name="refresh" /> Next test <kbd>Tab</kbd></button>
            <p><a href={profile.monkeytype} target="_blank" rel="noreferrer">Srikar on monkeytype</a></p>
          </div>
        </div>
      ) : (
        <div className="ty-test">
          <div className="ty-live" aria-live="off">
            <span className="ty-timer">{started ? dur - elapsed : dur}</span>
            {elapsed >= 2 && <span className="ty-live-wpm">{stats.wpm} wpm</span>}
          </div>
          <div ref={box} className="ty-words" tabIndex={0} onKeyDown={onKey} aria-label="Typing test. Type the words shown; space moves to the next word.">
            <div ref={inner} className="ty-inner">
              {words.map((w, wi) => {
                const t = typed[wi];
                const isCur = wi === cur;
                const committedWrong = wi < cur && t !== w;
                return (
                  <span key={wi} className={`ty-word ${committedWrong ? 'err' : ''}`}>
                    {[...w].map((ch, ci) => {
                      const c = t?.[ci];
                      const cls = [c === undefined ? '' : c === ch ? 'ok' : 'bad', isCur && ci === t.length ? 'caret' : ''].join(' ').trim();
                      return <span key={ci} className={cls || undefined}>{ch}</span>;
                    })}
                    {t && t.length > w.length && [...t.slice(w.length)].map((ch, xi) => <span key={`x${xi}`} className="extra">{ch}</span>)}
                    {isCur && t.length >= w.length && <span className="caret-end" />}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="ty-hint">{started ? <><kbd>Tab</kbd> restart</> : 'Click the words and start typing. The timer starts on your first key.'}</p>
        </div>
      )}
    </div>
  );
}
