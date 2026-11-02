import { AnimatePresence } from 'motion/react';
import { useOS } from '../os/store';
import { effectiveRect, type Rect } from '../os/wm';
import { Window, type WinTransform } from './Window';
import { useDragUI } from './dragUI';

/** Overview slots: an even grid inside the area under the search entry. */
function overviewSlots(n: number, area: Rect): Rect[] {
  if (n === 0) return [];
  const region = { x: area.x + 40, y: area.y + 96, w: area.w - 80, h: area.h - 140 };
  const cols = Math.ceil(Math.sqrt(n * (region.w / region.h) * 0.62));
  const c = Math.min(Math.max(cols, 1), n);
  const rows = Math.ceil(n / c);
  const cw = region.w / c;
  const ch = region.h / rows;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / c);
    const inRow = r === rows - 1 ? n - r * c : c;
    const rowOffset = ((c - inRow) * cw) / 2;
    return { x: region.x + rowOffset + (i % c) * cw + 18, y: region.y + r * ch + 14, w: cw - 36, h: ch - 50 };
  });
}

function fit(rect: Rect, slot: Rect): WinTransform {
  const scale = Math.min(slot.w / rect.w, slot.h / rect.h, 0.82);
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + slot.h / 2;
  return { x: cx - (rect.x + rect.w / 2), y: cy - (rect.y + rect.h / 2), scale, opacity: 1 };
}

function dockTarget(appId: string, rect: Rect): WinTransform {
  const icon = document.querySelector(`[data-dock-app="${appId}"]`)?.getBoundingClientRect();
  const tx = icon ? icon.x + icon.width / 2 : 34;
  const ty = icon ? icon.y + icon.height / 2 : window.innerHeight - 40;
  return { x: tx - (rect.x + rect.w / 2), y: ty - (rect.y + rect.h / 2), scale: 0.06, opacity: 0 };
}

export function WindowLayer() {
  const wmState = useOS((s) => s.wm);
  const area = useOS((s) => s.area);
  const overview = useOS((s) => s.overview);
  const appGrid = useOS((s) => s.appGrid);
  const snap = useDragUI((s) => s.snap);
  const dragging = useDragUI((s) => s.active);

  // Overview arranges by opening order (stable), not z-order, so thumbnails do not shuffle.
  const ids = Object.keys(wmState.windows);
  const shown = ids.filter((id) => !wmState.windows[id].minimized || overview);
  const slots = overview ? overviewSlots(shown.length, area) : [];

  return (
    <div className={`window-layer ${dragging ? 'is-dragging' : ''} ${appGrid ? 'behind-grid' : ''}`}>
      {snap && <div className="snap-preview" style={{ left: snap.x + 6, top: snap.y + 6, width: snap.w - 12, height: snap.h - 12 }} />}
      <AnimatePresence>
        {ids.map((id) => {
          const win = wmState.windows[id];
          const rect = effectiveRect(win, area);
          let transform: WinTransform | null = null;
          if (overview) transform = fit(rect, slots[shown.indexOf(id)]);
          else if (win.minimized) transform = dockTarget(win.appId, rect);
          return (
            <Window
              key={id}
              win={win}
              z={10 + wmState.order.indexOf(id)}
              focused={wmState.focused === id}
              transform={transform}
              overview={overview}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
