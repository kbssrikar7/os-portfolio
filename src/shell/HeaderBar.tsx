import { createPortal } from 'react-dom';
import { useWin } from './winContext';

/**
 * libadwaita-style header bar content. Apps render this anywhere in their tree
 * and it is portalled into their own window's title bar, so the title bar is
 * also the drag handle, just like GNOME's client-side decorations.
 */
export function HeaderBar({ start, title, end }: { start?: React.ReactNode; title?: React.ReactNode; end?: React.ReactNode }) {
  const { slot, title: fallback } = useWin();
  if (!slot) return null;
  return createPortal(
    <div className="hb">
      <div className="hb-start">{start}</div>
      <div className="hb-title">{title ?? <span className="hb-title-text">{fallback}</span>}</div>
      <div className="hb-end">{end}</div>
    </div>,
    slot,
  );
}
