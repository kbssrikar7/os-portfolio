import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { overviewOpener, useOS } from '../os/store';
import { APPS } from '../os/apps';
import { AppIcon } from '../icons/AppIcon';
import { Sym } from '../icons/Sym';
import { search, type Result } from './search';

function SearchBox({ value, onChange, onEnter, onMove }: { value: string; onChange: (v: string) => void; onEnter: () => void; onMove: (d: number) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <label className="ov-search">
      <Sym name="search" />
      <input
        ref={ref}
        value={value}
        placeholder="Type to search apps and projects"
        aria-label="Search"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onEnter();
          if (e.key === 'ArrowDown') { e.preventDefault(); onMove(1); }
          if (e.key === 'ArrowUp') { e.preventDefault(); onMove(-1); }
        }}
      />
    </label>
  );
}

function Results({ results, sel }: { results: Result[]; sel: number }) {
  const { openApp } = useOS.getState();
  if (!results.length) return <div className="ov-empty">No results</div>;
  const groups: [string, Result[]][] = [
    ['Apps', results.filter((r) => r.kind === 'app')],
    ['Projects', results.filter((r) => r.kind === 'project')],
  ];
  return (
    <div className="ov-results popover">
      {groups.map(([label, rs]) =>
        rs.length ? (
          <section key={label}>
            <h3>{label}</h3>
            {rs.map((r) => (
              <button key={r.kind + r.id} className={`ov-result ${results.indexOf(r) === sel ? 'sel' : ''}`} onClick={() => openApp(r.app, r.payload)}>
                <AppIcon app={r.icon} size={36} />
                <span><strong>{r.title}</strong><span>{r.sub}</span></span>
              </button>
            ))}
          </section>
        ) : null,
      )}
    </div>
  );
}

/** Activities overview and the Show Apps grid share the backdrop and search entry, as in GNOME. */
export function Overview() {
  const open = useOS((s) => s.overview || s.appGrid);
  return <AnimatePresence>{open && <OverviewPanel key="ov" />}</AnimatePresence>;
}

/** Mounted only while open, so the search query resets naturally on close. */
function OverviewPanel() {
  const appGrid = useOS((s) => s.appGrid);
  const reduce = useOS((s) => s.settings.reduceMotion);
  const hasWindows = useOS((s) => s.wm.order.length > 0);
  const { setOverview, setAppGrid, openApp } = useOS.getState();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const results = search(q);
  const grid = useRef<HTMLDivElement>(null);

  // Return focus to whatever opened the overview (the dock's Show Apps button, the
  // Activities pill) when it closes, so keyboard users are not dropped on <body>.
  useEffect(() => () => {
    const opener = overviewOpener;
    if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
  }, []);

  /** Arrow keys move through the grid in reading order, by row and column. */
  const onGridKey = (e: React.KeyboardEvent) => {
    const items = Array.from(grid.current?.querySelectorAll<HTMLButtonElement>('.ag-item') ?? []);
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const cols = items.filter((b) => b.offsetTop === items[0].offsetTop).length;
    const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && i < cols) {
      grid.current?.closest('.overview')?.querySelector<HTMLInputElement>('.ov-search input')?.focus();
      return;
    }
    items[Math.max(0, Math.min(items.length - 1, i + delta))]?.focus();
  };

  return (
    <motion.div
      className="overview"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.22 }}
      onClick={(e) => { if (e.target === e.currentTarget) setOverview(false); }}
    >
      <div className="ov-top" onClick={(e) => e.target === e.currentTarget && setOverview(false)}>
        <SearchBox value={q} onChange={(v) => { setQ(v); setSel(0); }} onMove={(d) => {
          if (!q && d > 0) grid.current?.querySelector<HTMLButtonElement>('.ag-item')?.focus();
          else setSel((s) => Math.max(0, Math.min(results.length - 1, s + d)));
        }} onEnter={() => {
          const r = results[sel];
          if (r) openApp(r.app, r.payload);
        }} />
      </div>
      {q ? (
        <Results results={results} sel={sel} />
      ) : appGrid ? (
        <motion.div ref={grid} className="app-grid" role="group" aria-label="Applications" onKeyDown={onGridKey} initial={reduce ? false : { scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }}>
          {APPS.map((a) => (
            <button key={a.id} className="ag-item" onClick={() => openApp(a.id)} title={a.description}>
              <AppIcon app={a.id} size={84} />
              <span>{a.name}</span>
            </button>
          ))}
        </motion.div>
      ) : (
        !hasWindows && (
          <div className="ov-hint" onClick={() => setOverview(false)}>
            <p>No open windows</p>
            <p className="dim">Search above, pick an app from the dock, or press <kbd>Esc</kbd></p>
          </div>
        )
      )}
      {appGrid && !q && <button className="ag-close" onClick={() => setAppGrid(false)} aria-label="Close app grid">Back to desktop</button>}
    </motion.div>
  );
}
