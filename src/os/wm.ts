/**
 * Pure window-manager model. Every shell interaction (dock, overview, title bar,
 * terminal `open`) goes through these functions, so focus, z-order and dock
 * indicators can never disagree. No DOM access here; see wm.test.ts.
 */
export type Rect = { x: number; y: number; w: number; h: number };
export type Size = { w: number; h: number };
export type WinMode = 'normal' | 'maximized' | 'left' | 'right';

export type Win = {
  id: string;
  appId: string;
  rect: Rect;
  min: Size;
  mode: WinMode;
  minimized: boolean;
  /** App-specific route, e.g. a project slug. */
  payload: string | null;
};

export type WMState = {
  windows: Record<string, Win>;
  /** Stacking order, bottom to top. */
  order: string[];
  focused: string | null;
};

export type OpenSpec = {
  appId: string;
  size: Size;
  min: Size;
  multi?: boolean;
  payload?: string | null;
};

export const emptyWM: WMState = { windows: {}, order: [], focused: null };

/** Minimum part of a title bar that must stay reachable so a window is never lost. */
const GRAB = 96;
const CASCADE = 28;

/** Width reserved on the left of the work area for the desktop icon column. */
export const ICON_COLUMN = 120;

/**
 * First-window placement: just right of the desktop icon column and near the
 * top, leaving the right of the wallpaper open (as the reference opens About at
 * x≈154 beside its icon column). Falls back to centring when there is no room.
 */
function centred(spec: OpenSpec, area: Rect, maxW: number, maxH: number): Rect {
  const w = Math.min(spec.size.w, maxW);
  const h = Math.min(spec.size.h, maxH);
  const x = area.w - w >= ICON_COLUMN + 12 ? area.x + ICON_COLUMN : area.x + (area.w - w) / 2;
  const y = area.y + Math.min(16, Math.max(0, area.h - h));
  return { x, y, w, h };
}

export function clampRect(rect: Rect, area: Rect, min: Size): Rect {
  const w = Math.max(Math.min(rect.w, area.w), Math.min(min.w, area.w));
  const h = Math.max(Math.min(rect.h, area.h), Math.min(min.h, area.h));
  const x = Math.min(Math.max(rect.x, area.x - w + GRAB), area.x + area.w - GRAB);
  const y = Math.min(Math.max(rect.y, area.y), area.y + area.h - 48);
  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

export function effectiveRect(win: Win, area: Rect): Rect {
  const half = Math.round(area.w / 2);
  switch (win.mode) {
    case 'maximized':
      return { ...area };
    case 'left':
      return { x: area.x, y: area.y, w: half, h: area.h };
    case 'right':
      return { x: area.x + half, y: area.y, w: area.w - half, h: area.h };
    default:
      return win.rect;
  }
}

function topVisible(state: WMState, exclude?: string): string | null {
  for (let i = state.order.length - 1; i >= 0; i--) {
    const id = state.order[i];
    if (id !== exclude && !state.windows[id].minimized) return id;
  }
  return null;
}

function patch(state: WMState, id: string, p: Partial<Win>): WMState {
  const win = state.windows[id];
  if (!win) return state;
  return { ...state, windows: { ...state.windows, [id]: { ...win, ...p } } };
}

export function focus(state: WMState, id: string): WMState {
  if (!state.windows[id]) return state;
  const next = patch(state, id, { minimized: false });
  return { ...next, order: [...next.order.filter((o) => o !== id), id], focused: id };
}

export function open(state: WMState, spec: OpenSpec, area: Rect): { state: WMState; id: string } {
  if (!spec.multi) {
    const existing = Object.values(state.windows).find((w) => w.appId === spec.appId);
    if (existing) {
      let next = state;
      if (spec.payload !== undefined) next = patch(next, existing.id, { payload: spec.payload });
      return { state: focus(next, existing.id), id: existing.id };
    }
  }
  let n = 1;
  let id = spec.appId;
  while (state.windows[id]) id = `${spec.appId}-${++n}`;

  // Cascade from the window in front (as the reference offsets Projects from About
  // by tens of pixels), so the window behind stays identifiable by its title bar.
  // With nothing open, centre. New windows always fit fully inside the area.
  const front = topVisible(state);
  const maxW = Math.max(area.w - 24, spec.min.w);
  const maxH = Math.max(area.h - 24, spec.min.h);
  let rect: Rect;
  if (front) {
    const f = state.windows[front];
    const fr = f.mode === 'normal' ? f.rect : { ...area };
    const x = Math.max(area.x, fr.x + CASCADE);
    const y = Math.max(area.y, fr.y + CASCADE);
    const w = Math.min(spec.size.w, maxW, area.x + area.w - x);
    const h = Math.min(spec.size.h, maxH, area.y + area.h - y);
    rect = w >= spec.min.w && h >= spec.min.h && f.mode === 'normal' ? { x, y, w, h } : centred(spec, area, maxW, maxH);
  } else {
    rect = centred(spec, area, maxW, maxH);
  }
  rect = clampRect(rect, area, spec.min);
  const win: Win = {
    id,
    appId: spec.appId,
    rect,
    min: spec.min,
    mode: area.w < 900 ? 'maximized' : 'normal',
    minimized: false,
    payload: spec.payload ?? null,
  };
  const next: WMState = { ...state, windows: { ...state.windows, [id]: win }, order: [...state.order, id], focused: id };
  return { state: next, id };
}

export function close(state: WMState, id: string): WMState {
  if (!state.windows[id]) return state;
  const windows = { ...state.windows };
  delete windows[id];
  const next: WMState = { windows, order: state.order.filter((o) => o !== id), focused: null };
  return { ...next, focused: state.focused === id ? topVisible(next) : state.focused };
}

export function minimize(state: WMState, id: string): WMState {
  if (!state.windows[id]) return state;
  const next = patch(state, id, { minimized: true });
  return { ...next, focused: topVisible(next, id) };
}

export function toggleMaximize(state: WMState, id: string): WMState {
  const win = state.windows[id];
  if (!win) return state;
  return focus(patch(state, id, { mode: win.mode === 'normal' ? 'maximized' : 'normal' }), id);
}

export function setMode(state: WMState, id: string, mode: WinMode): WMState {
  return focus(patch(state, id, { mode }), id);
}

/** Commit a drag or resize. Leaving maximized/snapped happens in the drag handler, which supplies the new rect. */
export function setRect(state: WMState, id: string, rect: Rect, area: Rect): WMState {
  const win = state.windows[id];
  if (!win) return state;
  return patch(state, id, { rect: clampRect(rect, area, win.min), mode: 'normal' });
}

export function setPayload(state: WMState, id: string, payload: string | null): WMState {
  return patch(state, id, { payload });
}

/** Re-fit every window after the viewport changes so nothing ends up out of reach. */
export function fitAll(state: WMState, area: Rect): WMState {
  const windows: Record<string, Win> = {};
  for (const [id, win] of Object.entries(state.windows)) {
    windows[id] = { ...win, rect: clampRect(win.rect, area, win.min) };
  }
  return { ...state, windows };
}

/** Which snap zone a pointer is in while dragging, mirroring GNOME edge tiling. */
export function snapZone(px: number, py: number, area: Rect): WinMode | null {
  const edge = 12;
  if (py <= area.y + 4) return 'maximized';
  if (px <= area.x + edge) return 'left';
  if (px >= area.x + area.w - edge) return 'right';
  return null;
}

/** Unsnapping by dragging: keep the grab point under the pointer, proportionally. */
export function unsnapRect(win: Win, current: Rect, px: number, py: number): Rect {
  const ratio = (px - current.x) / current.w;
  const w = win.rect.w;
  return { x: px - w * ratio, y: py - 18, w, h: win.rect.h };
}
