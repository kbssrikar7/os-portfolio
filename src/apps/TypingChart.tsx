import { useLayoutEffect, useRef, useState } from 'react';
import type { Sample } from './typingStats';

const H = 196;
const PAD = { l: 34, r: 40, t: 12, b: 26 };
const WPM = '#e2b714';
const RAW = '#8a8d91';
const ERR = '#ca4754';

/**
 * WPM over time. One y-axis (words per minute); raw is a dashed context line,
 * errors are marks along the time axis rather than a second scale. Both lines
 * are labelled at their ends, and a crosshair tooltip shows exact values.
 */
export function TypingChart({ samples, dur }: { samples: Sample[]; dur: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(560);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!samples.length) return <div ref={wrap} className="ty-chart" />;
  const top = Math.max(...samples.map((s) => Math.max(s.wpm, s.raw)), 20);
  // Nice 1/2/5 step aiming for about four gridlines, whatever the range.
  const rough = top / 5;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * mag).find((v) => v >= rough) ?? 10 * mag;
  const yMax = Math.ceil((top * 1.05) / step) * step;
  const x = (sec: number) => PAD.l + ((sec - 1) / Math.max(dur - 1, 1)) * (w - PAD.l - PAD.r);
  const y = (v: number) => PAD.t + (1 - v / yMax) * (H - PAD.t - PAD.b);
  const path = (k: 'wpm' | 'raw') => samples.map((s, i) => `${i ? 'L' : 'M'}${x(s.sec).toFixed(1)},${y(s[k]).toFixed(1)}`).join('');
  const last = samples[samples.length - 1];
  const ticks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const xTicks = samples.filter((s) => s.sec === 1 || s.sec % (dur > 30 ? 10 : 5) === 0);
  const h = hover !== null ? samples[hover] : null;

  const onMove = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const sec = 1 + ((e.clientX - r.left) / r.width) * (dur - 1);
    const i = samples.findIndex((s) => s.sec >= Math.round(sec));
    setHover(i < 0 ? samples.length - 1 : i);
  };

  return (
    <div ref={wrap} className="ty-chart">
      <div className="ty-legend" aria-hidden>
        <span><i style={{ background: WPM }} /> wpm</span>
        <span><i className="dash" style={{ borderColor: RAW }} /> raw</span>
        <span><b style={{ color: ERR }}>×</b> errors</span>
      </div>
      <svg width={w} height={H} role="img" aria-label={`Words per minute over ${dur} seconds. Final ${last.wpm} wpm.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={w - PAD.r} y1={y(t)} y2={y(t)} className="ty-grid" />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" className="ty-axis">{t}</text>
          </g>
        ))}
        {xTicks.map((s) => (
          <text key={s.sec} x={x(s.sec)} y={H - 6} textAnchor="middle" className="ty-axis">{s.sec}</text>
        ))}
        <path d={path('raw')} fill="none" stroke={RAW} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path('wpm')} fill="none" stroke={WPM} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {samples.filter((s) => s.errors > 0).map((s) => (
          <text key={s.sec} x={x(s.sec)} y={H - PAD.b - 4} textAnchor="middle" className="ty-err" fill={ERR}>×</text>
        ))}
        <text x={x(last.sec) + 6} y={y(last.wpm) + 4} className="ty-end" fill="currentColor">{last.wpm}</text>
        {h && (
          <g pointerEvents="none">
            <line x1={x(h.sec)} x2={x(h.sec)} y1={PAD.t} y2={H - PAD.b} className="ty-cross" />
            <circle cx={x(h.sec)} cy={y(h.wpm)} r={4} fill={WPM} stroke="#2c2e31" strokeWidth={2} />
            <circle cx={x(h.sec)} cy={y(h.raw)} r={4} fill={RAW} stroke="#2c2e31" strokeWidth={2} />
          </g>
        )}
        <rect x={PAD.l} y={PAD.t} width={w - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
      </svg>
      {h && (
        <div className="ty-tip" style={{ left: Math.min(x(h.sec) + 12, w - 130), top: 28 }}>
          <strong>{h.sec}s</strong>
          <span><i style={{ background: WPM }} />wpm <b>{h.wpm}</b></span>
          <span><i style={{ background: RAW }} />raw <b>{h.raw}</b></span>
          <span><i style={{ background: ERR }} />errors <b>{h.errors}</b></span>
        </div>
      )}
    </div>
  );
}
