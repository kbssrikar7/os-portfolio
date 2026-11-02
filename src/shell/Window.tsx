import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useOS } from '../os/store';
import { APP_BY_ID } from '../os/apps';
import { effectiveRect, snapZone, unsnapRect, type Rect, type Win, type WinMode } from '../os/wm';
import { Symbolic } from '../icons/Symbolic';
import { AppContent } from '../apps';
import { useDragUI } from './dragUI';
import { WinContext } from './winContext';


type Dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
const DIRS: Dir[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

function zoneRect(mode: WinMode, area: Rect): Rect {
  const half = Math.round(area.w / 2);
  if (mode === 'left') return { x: area.x, y: area.y, w: half, h: area.h };
  if (mode === 'right') return { x: area.x + half, y: area.y, w: area.w - half, h: area.h };
  return { ...area };
}

export type WinTransform = { x: number; y: number; scale: number; opacity: number };

type Props = {
  win: Win;
  focused: boolean;
  z: number;
  /** Overview or minimize target; null when the window sits at its own rect. */
  transform: WinTransform | null;
  overview: boolean;
};

export const Window = memo(function Window({ win, focused, z, transform, overview }: Props) {
  const area = useOS((s) => s.area);
  const mobile = useOS((s) => s.mobile);
  const reduceMotion = useOS((s) => s.settings.reduceMotion);
  const { focusWin, closeWin, minimizeWin, toggleMax, setMode, commitRect, setOverview } = useOS.getState();
  const el = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  const rect = effectiveRect(win, area);
  const meta = APP_BY_ID[win.appId as keyof typeof APP_BY_ID];

  const apply = (r: Rect) => {
    const s = el.current?.style;
    if (!s) return;
    s.left = `${r.x}px`;
    s.top = `${r.y}px`;
    s.width = `${r.w}px`;
    s.height = `${r.h}px`;
  };

  // Keep DOM geometry in sync with the store whenever React owns it.
  useEffect(() => {
    if (!live) apply(rect);
  });

  const onTitlePointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.button !== 0 || overview || mobile) return;
      if ((e.target as HTMLElement).closest('button, input, a, select, textarea, [data-no-drag]')) return;
      const node = el.current;
      if (!node) return;
      e.preventDefault();
      focusWin(win.id);
      const startX = e.clientX;
      const startY = e.clientY;
      let base = effectiveRect(win, area);
      let moved = false;
      let zone: WinMode | null = null;
      let current = base;
      node.setPointerCapture(e.pointerId);

      const move = (ev: PointerEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved) {
          if (Math.hypot(dx, dy) < 4) return;
          moved = true;
          setLive(true);
          useDragUI.getState().set({ active: true });
          if (win.mode !== 'normal') {
            // Unsnap under the pointer, keeping the grab point proportional.
            base = unsnapRect(win, base, startX, startY);
          }
        }
        current = { ...base, x: base.x + dx, y: Math.max(area.y, base.y + dy) };
        apply(current);
        const z2 = snapZone(ev.clientX, ev.clientY, area);
        if (z2 !== zone) {
          zone = z2;
          useDragUI.getState().set({ snap: z2 ? zoneRect(z2, area) : null });
        }
      };
      const up = () => {
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerup', up);
        node.removeEventListener('pointercancel', up);
        useDragUI.getState().set({ active: false, snap: null });
        if (!moved) return;
        if (zone) {
          // Remember the free-floating size for when it is dragged back out.
          commitRect(win.id, { ...current, w: base.w, h: base.h });
          setMode(win.id, zone);
        } else {
          commitRect(win.id, current);
        }
        setLive(false);
      };
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerup', up);
      node.addEventListener('pointercancel', up);
    },
    [win, area, overview, mobile, focusWin, commitRect, setMode],
  );

  const onResizeDown = (dir: Dir) => (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    const node = el.current;
    if (!node) return;
    focusWin(win.id);
    const start = effectiveRect(win, area);
    const sx = e.clientX;
    const sy = e.clientY;
    let current = start;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setLive(true);
    useDragUI.getState().set({ active: true });
    const target = e.target as HTMLElement;

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      let { x, y, w, h } = start;
      if (dir.includes('e')) w = Math.min(Math.max(win.min.w, start.w + dx), area.x + area.w - start.x);
      if (dir.includes('s')) h = Math.min(Math.max(win.min.h, start.h + dy), area.y + area.h - start.y);
      if (dir.includes('w')) {
        w = Math.max(win.min.w, start.w - dx);
        x = start.x + start.w - w;
      }
      if (dir.includes('n')) {
        h = Math.max(win.min.h, start.h - dy);
        y = start.y + start.h - h;
        if (y < area.y) {
          h -= area.y - y;
          y = area.y;
        }
      }
      current = { x, y, w, h };
      apply(current);
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      useDragUI.getState().set({ active: false });
      commitRect(win.id, current);
      setLive(false);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  };

  // Native listeners: header content is portalled in by the app, and React
  // synthetic events follow the component tree, not the DOM, so a React
  // onPointerDown on <header> would never see presses on that content.
  const headerRef = useRef<HTMLElement>(null);
  const handlers = useRef({ down: (_e: PointerEvent) => {}, dbl: (_e: MouseEvent) => {} });
  useLayoutEffect(() => {
    handlers.current.down = onTitlePointerDown;
    handlers.current.dbl = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, input, a, [data-no-drag]') || mobile) return;
      toggleMax(win.id);
    };
  });
  useEffect(() => {
    const h = headerRef.current;
    if (!h) return;
    const down = (e: PointerEvent) => handlers.current.down(e);
    const dbl = (e: MouseEvent) => handlers.current.dbl(e);
    h.addEventListener('pointerdown', down);
    h.addEventListener('dblclick', dbl);
    return () => {
      h.removeEventListener('pointerdown', down);
      h.removeEventListener('dblclick', dbl);
    };
  }, []);

  const t = transform ?? { x: 0, y: 0, scale: 1, opacity: 1 };
  const hidden = win.minimized && !overview;
  const duration = reduceMotion ? 0 : 0.28;

  return (
    <div
      ref={el}
      data-win-id={win.id}
      className={`win-frame ${live ? 'live' : ''} ${win.mode !== 'normal' ? `mode-${win.mode}` : ''}`}
      style={{ zIndex: z, left: rect.x, top: rect.y, width: rect.w, height: rect.h, pointerEvents: hidden ? 'none' : undefined }}
      inert={hidden}
      onPointerDownCapture={() => !overview && focusWin(win.id)}
    >
      <motion.div
        className={`win ${focused && !overview ? 'focused' : ''} ${overview ? 'in-overview' : ''}`}
        role="dialog"
        aria-label={meta?.name}
        initial={reduceMotion ? false : { scale: 0.94, opacity: 0 }}
        animate={{ x: t.x, y: t.y, scale: t.scale, opacity: t.opacity }}
        exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { scale: 0.94, opacity: 0, transition: { duration: 0.16 } }}
        transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        onClick={
          overview
            ? (e) => {
                e.stopPropagation();
                focusWin(win.id);
                setOverview(false);
              }
            : undefined
        }
      >
        <header className="win-header" ref={headerRef}>
          <div className="win-header-slot" ref={setSlot} />
          <div className="win-controls">
            {!mobile && (
              <>
                <button className="wc" aria-label="Minimize" onClick={() => minimizeWin(win.id)}>
                  <Symbolic name="window-minimize-symbolic" />
                </button>
                <button className="wc" aria-label={win.mode === 'normal' ? 'Maximize' : 'Restore'} onClick={() => toggleMax(win.id)}>
                  <Symbolic name={win.mode === 'normal' ? 'window-maximize-symbolic' : 'window-restore-symbolic'} />
                </button>
              </>
            )}
            <button className="wc wc-close" aria-label="Close" onClick={() => closeWin(win.id)}>
              <Symbolic name="window-close-symbolic" />
            </button>
          </div>
        </header>
        <div className="win-body">
          <WinContext.Provider value={{ winId: win.id, slot, focused, title: meta?.name ?? '' }}>
            <AppContent appId={win.appId} winId={win.id} payload={win.payload} />
          </WinContext.Provider>
        </div>
        {overview && <div className="win-shield" />}
      </motion.div>
      {overview && <div className="win-ov-label" style={{ transform: `translate(${t.x}px, ${t.y + (rect.h * t.scale) / 2 + 14}px)` }}>{meta?.name}</div>}
      {win.mode === 'normal' && !overview && !mobile &&
        DIRS.map((d) => <div key={d} className={`rz rz-${d}`} onPointerDown={onResizeDown(d)} />)}
    </div>
  );
});
