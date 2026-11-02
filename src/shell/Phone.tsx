import { useRef, useState } from 'react';
import { useOS, appWindows } from '../os/store';
import { APPS, APP_BY_ID, type AppId } from '../os/apps';
import { AppIcon } from '../icons/AppIcon';
import { Symbolic } from '../icons/Symbolic';
import { Wallpaper } from './Wallpaper';
import { WindowLayer } from './WindowLayer';
import { Avatar } from './Login';
import { fmtTime, useClock } from './useClock';
import { volumeIcon } from './volumeIcon';
import { readJSON, writeJSON } from '../lib/storage';
import { profile } from '../data/profile';

/**
 * Phones get Ubuntu Touch (Lomiri), not a shrunken GNOME desktop:
 * a black indicator panel (swipe or tap it to open the indicator menu), the
 * left-edge launcher with the orange Ubuntu button, the app drawer, and the
 * lock-screen greeter. Apps run full screen beneath the panel.
 */
const PINNED: AppId[] = ['about', 'projects', 'resume', 'contact', 'terminal'];

export const PANEL_H = 30;

function PhonePanel({ onOpen }: { onOpen: () => void }) {
  const now = useClock();
  const s = useOS((st) => st.settings);
  const focused = useOS((st) => (st.wm.focused ? st.wm.windows[st.wm.focused] : null));
  const drag = useRef<number | null>(null);
  return (
    <div
      className="lp-panel"
      onPointerDown={(e) => { drag.current = e.clientY; }}
      onPointerMove={(e) => { if (drag.current !== null && e.clientY - drag.current > 18) { drag.current = null; onOpen(); } }}
      onPointerUp={() => { drag.current = null; }}
    >
      <span className="lp-panel-title">{focused ? APP_BY_ID[focused.appId as AppId]?.name : ''}</span>
      <button className="lp-indicators" onClick={onOpen} aria-label="Open indicators">
        {s.airplane ? <Symbolic name="airplane-mode-symbolic" /> : s.wifi && <Symbolic name="network-wireless-signal-excellent-symbolic" />}
        {s.bluetooth && <Symbolic name="bluetooth-active-symbolic" />}
        <Symbolic name={volumeIcon(s.volume, s.muted)} />
        <Symbolic name="battery-level-100-charged-symbolic" />
        <span className="lp-time">{fmtTime(now)}</span>
      </button>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return <input type="checkbox" className="lp-switch" checked={on} onChange={onChange} aria-label={label} />;
}

/** Lomiri indicator menu: a dark sheet pulled down from the panel. */
function Indicators({ onClose }: { onClose: () => void }) {
  const s = useOS((st) => st.settings);
  const { updateSettings, setSession, logout } = useOS.getState();
  const [brightness, setBrightness] = useState(() => Math.round((Number(document.documentElement.style.getPropertyValue('--brightness')) || 1) * 100));
  const now = useClock();
  return (
    <div className="lp-ind-backdrop" onClick={onClose}>
      <div className="lp-ind" role="dialog" aria-label="Indicators" onClick={(e) => e.stopPropagation()}>
        <div className="lp-ind-head">
          <span>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <span className="lp-ind-batt"><Symbolic name="battery-level-100-charged-symbolic" /> 100%</span>
        </div>
        <ul className="lp-list">
          <li><span>Flight Mode</span><Switch label="Flight Mode" on={s.airplane} onChange={() => updateSettings({ airplane: !s.airplane })} /></li>
          <li><span>Wi-Fi<small>{s.wifi && !s.airplane ? 'kbs-5G' : 'Off'}</small></span><Switch label="Wi-Fi" on={s.wifi && !s.airplane} onChange={() => updateSettings({ wifi: !s.wifi, airplane: false })} /></li>
          <li><span>Bluetooth</span><Switch label="Bluetooth" on={s.bluetooth} onChange={() => updateSettings({ bluetooth: !s.bluetooth })} /></li>
          <li><span>Dark theme</span><Switch label="Dark theme" on={s.theme === 'dark'} onChange={() => updateSettings({ theme: s.theme === 'dark' ? 'light' : 'dark' })} /></li>
          <li className="lp-slider">
            <Symbolic name={volumeIcon(s.volume, s.muted)} />
            <input type="range" min={0} max={100} value={s.muted ? 0 : s.volume} aria-label="Volume" style={{ '--v': `${s.muted ? 0 : s.volume}%` } as React.CSSProperties} onChange={(e) => updateSettings({ volume: Number(e.target.value), muted: false })} />
          </li>
          <li className="lp-slider">
            <Symbolic name="display-brightness-symbolic" />
            <input type="range" min={0} max={100} value={brightness} aria-label="Brightness" style={{ '--v': `${brightness}%` } as React.CSSProperties}
              onChange={(e) => { const v = Number(e.target.value); setBrightness(v); document.documentElement.style.setProperty('--brightness', String(0.3 + (v / 100) * 0.7)); }} />
          </li>
          <li><button className="lp-row-btn" onClick={() => { onClose(); setSession('locked'); }}>Lock phone</button></li>
          <li><button className="lp-row-btn" onClick={() => { onClose(); logout(); setSession('off'); }}>Power off…</button></li>
        </ul>
        <div className="lp-ind-grip" aria-hidden />
      </div>
    </div>
  );
}

/** The Lomiri launcher: orange Ubuntu button on top, pinned and running apps below. */
function Launcher({ open, onDrawer, onClose }: { open: boolean; onDrawer: () => void; onClose: () => void }) {
  const wmState = useOS((s) => s.wm);
  const { activateApp, focusWin } = useOS.getState();
  const running = APPS.filter((a) => !PINNED.includes(a.id) && appWindows(wmState, a.id).length).map((a) => a.id);
  return (
    <nav className={`lp-launcher ${open ? 'open' : ''}`} aria-label="Launcher" aria-hidden={!open} inert={!open}>
      <button className="lp-bfb" aria-label="Show apps" onClick={onDrawer}><span className="lp-bfb-logo" /></button>
      {[...PINNED, ...running].map((id) => {
        const wins = appWindows(wmState, id);
        return (
          <button key={id} className="lp-app" aria-label={APP_BY_ID[id].name} onClick={() => {
            onClose();
            useOS.getState().setAppGrid(false);
            if (wins.length) focusWin(wins[wins.length - 1]);
            else activateApp(id);
          }}>
            {wins.length > 0 && <i className="lp-pip" />}
            <AppIcon app={id} size={44} />
          </button>
        );
      })}
    </nav>
  );
}

/** App drawer: search plus every app, alphabetical, as Lomiri lists them. */
function Drawer({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const { openApp } = useOS.getState();
  const apps = [...APPS].sort((a, b) => a.name.localeCompare(b.name)).filter((a) => !q || `${a.name} ${a.keywords.join(' ')}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="lp-drawer" role="dialog" aria-label="Apps">
      <label className="lp-search">
        <Symbolic name="edit-find-symbolic" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" aria-label="Search apps" />
      </label>
      <div className="lp-drawer-grid">
        {apps.map((a) => (
          <button key={a.id} className="lp-drawer-app" onClick={() => { onClose(); openApp(a.id); }}>
            <AppIcon app={a.id} size={56} />
            <span>{a.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** First-run hint, like Lomiri's own edge tutorial. */
function EdgeTutorial({ onDone }: { onDone: () => void }) {
  return (
    <div className="lp-tutorial" onClick={onDone}>
      <div className="lp-tutorial-arrow" aria-hidden />
      <p>Short swipe from the left edge to open the launcher</p>
      <span>Tap here to continue</span>
    </div>
  );
}

export function PhoneShell() {
  const focused = useOS((s) => s.wm.focused);
  const appGrid = useOS((s) => s.appGrid);
  const { setAppGrid } = useOS.getState();
  const [launcher, setLauncher] = useState(false);
  const [ind, setInd] = useState(false);
  const [tip, setTip] = useState(() => !readJSON('local', 'portfolio.phoneTip', { seen: false }).seen);
  const edge = useRef<number | null>(null);

  // With no app in front, the launcher and drawer are the home screen.
  const home = !focused;
  const showLauncher = launcher || home;
  const showDrawer = appGrid || home;

  return (
    <div
      className="phone"
      onPointerDown={(e) => { if (e.clientX <= 14 && !home) edge.current = e.clientX; }}
      onPointerMove={(e) => {
        if (edge.current === null) return;
        const dx = e.clientX - edge.current;
        if (dx > 24) setLauncher(true);
        if (dx > 200) setAppGrid(true);
      }}
      onPointerUp={() => { edge.current = null; }}
    >
      <Wallpaper />
      <WindowLayer />
      {(launcher || appGrid) && !home && <div className="lp-scrim" onClick={() => { setLauncher(false); setAppGrid(false); }} />}
      {showDrawer && <Drawer onClose={() => setAppGrid(false)} />}
      <Launcher open={showLauncher} onDrawer={() => setAppGrid(!appGrid || home)} onClose={() => setLauncher(false)} />
      <PhonePanel onOpen={() => setInd(true)} />
      {ind && <Indicators onClose={() => setInd(false)} />}
      {tip && focused && <EdgeTutorial onDone={() => { setTip(false); writeJSON('local', 'portfolio.phoneTip', { seen: true }); }} />}
    </div>
  );
}

/** Lomiri greeter: clock and date over the wallpaper; swipe up (or tap) to unlock. */
export function PhoneGreeter({ onUnlock }: { onUnlock: () => void }) {
  const now = useClock();
  const start = useRef<number | null>(null);
  const [dy, setDy] = useState(0);
  return (
    <div
      className="lp-greeter"
      style={{ transform: `translateY(${Math.min(0, dy)}px)`, opacity: 1 + Math.min(0, dy) / 500 }}
      onPointerDown={(e) => { start.current = e.clientY; }}
      onPointerMove={(e) => { if (start.current !== null) setDy(e.clientY - start.current); }}
      onPointerUp={() => {
        if (start.current !== null && dy < -90) onUnlock();
        else if (start.current !== null && Math.abs(dy) < 6) onUnlock();
        start.current = null;
        setDy(0);
      }}
    >
      <Wallpaper />
      <div className="lp-greeter-shade" />
      <div className="lp-panel"><span /><span className="lp-indicators static"><Symbolic name="network-wireless-signal-excellent-symbolic" /><Symbolic name="battery-level-100-charged-symbolic" /><span className="lp-time">{fmtTime(now)}</span></span></div>
      <div className="lp-greeter-clock">
        <span className="lp-greeter-time">{fmtTime(now)}</span>
        <span className="lp-greeter-date">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
      </div>
      <div className="lp-greeter-user"><Avatar size={56} /><span>{profile.name}</span></div>
      <div className="lp-greeter-hint"><span className="lp-chevron" aria-hidden />Swipe up to unlock</div>
    </div>
  );
}
