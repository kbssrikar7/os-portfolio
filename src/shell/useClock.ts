import { useEffect, useState } from 'react';

export function useClock(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(t);
  }, [intervalMs]);
  return now;
}

export const fmtTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
/** GNOME's default clock (clock-show-weekday off): "Nov 2  17:42". */
export const fmtTopDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
