import { useState } from 'react';
import { useOS } from '../os/store';
import { Symbolic } from '../icons/Symbolic';
import { TopPopover } from './Popover';
import { useClock } from './useClock';

function Month() {
  const today = useClock(60_000);
  const [offset, setOffset] = useState(0);
  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const startDay = view.getDay(); // Sunday first, as GNOME does in en-US
  const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = Array.from({ length: Math.ceil((startDay + days) / 7) * 7 }, (_, i) => i - startDay + 1);
  const isToday = (d: number) => offset === 0 && d === today.getDate();
  return (
    <div className="cal">
      <div className="cal-today">
        <div className="cal-day">{today.toLocaleDateString('en-US', { weekday: 'long' })}</div>
        <div className="cal-date">{today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
      </div>
      <div className="cal-head">
        <button className="cal-pager" aria-label="Previous month" onClick={() => setOffset(offset - 1)}><Symbolic name="go-previous-symbolic" /></button>
        <span>{view.toLocaleDateString([], { month: 'long', year: offset ? 'numeric' : undefined })}</span>
        <button className="cal-pager" aria-label="Next month" onClick={() => setOffset(offset + 1)}><Symbolic name="go-next-symbolic" /></button>
      </div>
      <div className="cal-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i} className="cal-wd">{d}</span>)}
        {cells.map((d, i) => (
          <span key={i} className={`cal-cell ${d < 1 || d > days ? 'out' : ''} ${isToday(d) ? 'today' : ''}`}>
            {d >= 1 && d <= days ? d : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CalendarMenu() {
  const notes = useOS((s) => s.notes);
  const dnd = useOS((s) => s.settings.dnd);
  const { clearNotes, updateSettings, openApp } = useOS.getState();
  return (
    <TopPopover className="calmenu" label="Notifications and calendar">
      <div className="calmenu-notes">
        {notes.length === 0 ? (
          <div className="notes-empty"><Symbolic name="notifications-disabled-symbolic" size={64} /><span>No Notifications</span></div>
        ) : (
          <ul className="notes-list">
            {notes.map((n) => (
              <li key={n.id}>
                <button className="note" onClick={() => n.app && openApp(n.app, n.payload)}>
                  <span className="note-title">{n.title}<time>{new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></span>
                  <span className="note-body">{n.body}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="notes-foot">
          <label className="switch-row">
            <span>Do Not Disturb</span>
            <input type="checkbox" className="switch" checked={dnd} onChange={() => updateSettings({ dnd: !dnd })} />
          </label>
          <button className="pill-btn" disabled={!notes.length} onClick={clearNotes}>Clear</button>
        </div>
      </div>
      <div className="calmenu-side">
        <Month />
        <div className="cal-events">
          <span className="cal-events-title">Today</span>
          <span className="cal-events-empty">No Events</span>
        </div>
      </div>
    </TopPopover>
  );
}
