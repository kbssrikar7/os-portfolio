import { useEffect, useRef } from 'react';
import { useOS } from '../os/store';
import { Symbolic } from '../icons/Symbolic';
import { volumeIcon } from './volumeIcon';
import { fmtTime, fmtTopDate, useClock } from './useClock';
import { QuickSettings } from './QuickSettings';
import { CalendarMenu } from './CalendarMenu';

export function TopBar({ variant = 'desktop' }: { variant?: 'desktop' | 'login' }) {
  const now = useClock();
  const menu = useOS((s) => s.menu);
  const overview = useOS((s) => s.overview);
  const appGrid = useOS((s) => s.appGrid);
  const settings = useOS((s) => s.settings);
  const notes = useOS((s) => s.notes);
  const { setMenu, setOverview } = useOS.getState();
  const hot = useRef(0);

  // GNOME hot corner: pushing the pointer into the top-left corner toggles the overview.
  useEffect(() => {
    if (variant !== 'desktop') return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.buttons) return;
      if (e.clientX <= 1 && e.clientY <= 1) {
        const t = performance.now();
        if (t - hot.current > 700) {
          hot.current = t;
          const s = useOS.getState();
          s.setOverview(!s.overview);
        }
      }
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [variant]);

  const toggle = (m: 'quick' | 'calendar') => setMenu(menu === m ? null : m);
  const inActivities = overview || appGrid;

  return (
    <div className="topbar" role="banner">
      <div className="tb-left">
        {variant === 'desktop' && (
          <button
            className={`tb-btn tb-activities ${inActivities ? 'on' : ''}`}
            aria-label="Activities"
            aria-pressed={inActivities}
            onClick={() => setOverview(!inActivities)}
          >
            <span className="ws-pill" />
            <span className="ws-dot" />
          </button>
        )}
      </div>
      <button className={`tb-btn tb-clock ${menu === 'calendar' ? 'on' : ''}`} onClick={() => toggle('calendar')} aria-haspopup="dialog" aria-expanded={menu === 'calendar'}>
        <span>{fmtTopDate(now)}</span>
        <span className="tb-time">{fmtTime(now)}</span>
        {notes.length > 0 && !settings.dnd && <span className="tb-note-dot" aria-label={`${notes.length} notifications`} />}
        {settings.dnd && <Symbolic name="notifications-disabled-symbolic" />}
      </button>
      <div className="tb-right">
        <button className={`tb-btn tb-status ${menu === 'quick' ? 'on' : ''}`} aria-label="System menu" onClick={() => toggle('quick')} aria-haspopup="dialog" aria-expanded={menu === 'quick'}>
          {settings.airplane ? <Symbolic name="airplane-mode-symbolic" /> : settings.wifi && <Symbolic name="network-wireless-signal-excellent-symbolic" />}
          {settings.bluetooth && <Symbolic name="bluetooth-active-symbolic" />}
          <Symbolic name={volumeIcon(settings.volume, settings.muted)} />
          <Symbolic name="battery-level-100-charged-symbolic" />
          {variant === 'login' && <Symbolic name="system-shutdown-symbolic" />}
        </button>
      </div>
      {menu === 'quick' && <QuickSettings variant={variant} />}
      {menu === 'calendar' && <CalendarMenu />}
    </div>
  );
}
