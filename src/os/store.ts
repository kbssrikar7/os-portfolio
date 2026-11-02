import { create } from 'zustand';
import { APP_BY_ID, type AppId } from './apps';
import * as wm from './wm';
import { readJSON, writeJSON } from '../lib/storage';
import { sound } from './sound';

export type Session = 'boot' | 'login' | 'desktop' | 'locked' | 'off';
export type Menu = 'quick' | 'calendar' | null;

export const ACCENTS = {
  orange: '#E95420',
  bark: '#787859',
  sage: '#657B69',
  olive: '#4B8501',
  viridian: '#03875B',
  prussian: '#308280',
  blue: '#0073E5',
  purple: '#7764D8',
  magenta: '#B34CB3',
  red: '#DA3450',
} as const;
export type Accent = keyof typeof ACCENTS;

export const WALLPAPERS = ['ubuntu', 'fuwafuwa'] as const;
export type Wallpaper = (typeof WALLPAPERS)[number];

export type Settings = {
  theme: 'dark' | 'light';
  accent: Accent;
  wallpaper: Wallpaper;
  reduceMotion: boolean;
  volume: number;
  muted: boolean;
  dnd: boolean;
  /** Quick-settings toggles. Wi-Fi, Bluetooth, Airplane and Power Mode are visual state only; Night Light tints the screen. */
  wifi: boolean;
  bluetooth: boolean;
  airplane: boolean;
  nightLight: boolean;
  powerMode: 'performance' | 'balanced' | 'power-saver';
};

export type Note = { id: number; title: string; body: string; app?: AppId; payload?: string; time: number };

export const TOP_H = 32;
export const DOCK_W = 68;
export const MOBILE_BP = 768;

export function computeArea(vw: number, vh: number): wm.Rect {
  if (vw < MOBILE_BP) return { x: 0, y: 30, w: vw, h: vh - 30 };
  return { x: DOCK_W, y: TOP_H, w: vw - DOCK_W, h: vh - TOP_H };
}

const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const defaultSettings: Settings = {
  // Ubuntu 24.04 ships with the light ("Default") style; Dark Style is one click away.
  theme: 'light',
  accent: 'orange',
  wallpaper: 'ubuntu',
  reduceMotion: Boolean(prefersReduced),
  volume: 60,
  muted: false,
  dnd: false,
  wifi: true,
  bluetooth: false,
  airplane: false,
  nightLight: false,
  powerMode: 'balanced',
};

type OS = {
  session: Session;
  wm: wm.WMState;
  area: wm.Rect;
  mobile: boolean;
  overview: boolean;
  appGrid: boolean;
  menu: Menu;
  settings: Settings;
  notes: Note[];
  banner: Note | null;
  /** Window ids that are mid open/close animation are tracked by the Window component itself. */
  setSession: (s: Session) => void;
  setViewport: (vw: number, vh: number) => void;
  openApp: (appId: AppId, payload?: string | null) => string;
  focusWin: (id: string) => void;
  closeWin: (id: string) => void;
  closeApp: (appId: AppId) => void;
  minimizeWin: (id: string) => void;
  toggleMax: (id: string) => void;
  setMode: (id: string, mode: wm.WinMode) => void;
  commitRect: (id: string, rect: wm.Rect) => void;
  setPayload: (id: string, payload: string | null) => void;
  /** Dock click: GNOME semantics. Not running: open. Focused: minimize. Otherwise: raise. */
  activateApp: (appId: AppId) => void;
  setOverview: (v: boolean) => void;
  setAppGrid: (v: boolean) => void;
  setMenu: (m: Menu) => void;
  updateSettings: (p: Partial<Settings>) => void;
  notify: (n: Omit<Note, 'id' | 'time'>) => void;
  dismissBanner: () => void;
  clearNotes: () => void;
  logout: () => void;
};

let noteId = 1;

/** The control that opened Activities / Show Apps, so focus can return to it on close. */
export let overviewOpener: HTMLElement | null = null;
function rememberOpener() {
  overviewOpener = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
}
let bannerTimer: number | undefined;

const initialVw = typeof window !== 'undefined' ? window.innerWidth : 1440;
const initialVh = typeof window !== 'undefined' ? window.innerHeight : 900;

export const useOS = create<OS>((set, get) => ({
  session: 'boot',
  wm: wm.emptyWM,
  area: computeArea(initialVw, initialVh),
  mobile: initialVw < MOBILE_BP,
  overview: false,
  appGrid: false,
  menu: null,
  settings: readJSON('local', 'portfolio.settings', defaultSettings),
  notes: [],
  banner: null,

  setSession: (session) => set({ session, overview: false, appGrid: false, menu: null }),

  setViewport: (vw, vh) => {
    const area = computeArea(vw, vh);
    set((s) => ({ area, mobile: vw < MOBILE_BP, wm: wm.fitAll(s.wm, area) }));
  },

  openApp: (appId, payload) => {
    const meta = APP_BY_ID[appId];
    const { state, id } = wm.open(
      get().wm,
      { appId, size: meta.size, min: meta.min, multi: meta.multi, payload },
      get().area,
    );
    set({ wm: state, overview: false, appGrid: false, menu: null });
    return id;
  },

  focusWin: (id) => {
    const s = get();
    if (s.wm.focused === id && s.wm.order.at(-1) === id && !s.wm.windows[id]?.minimized) return;
    set({ wm: wm.focus(s.wm, id) });
  },
  closeWin: (id) => set((s) => ({ wm: wm.close(s.wm, id) })),
  closeApp: (appId) =>
    set((s) => {
      let next = s.wm;
      for (const w of Object.values(s.wm.windows)) if (w.appId === appId) next = wm.close(next, w.id);
      return { wm: next };
    }),
  minimizeWin: (id) => set((s) => ({ wm: wm.minimize(s.wm, id) })),
  toggleMax: (id) => set((s) => ({ wm: wm.toggleMaximize(s.wm, id) })),
  setMode: (id, mode) => set((s) => ({ wm: wm.setMode(s.wm, id, mode) })),
  commitRect: (id, rect) => set((s) => ({ wm: wm.setRect(s.wm, id, rect, s.area) })),
  setPayload: (id, payload) => set((s) => ({ wm: wm.setPayload(s.wm, id, payload) })),

  activateApp: (appId) => {
    const s = get();
    const wins = s.wm.order.filter((id) => s.wm.windows[id].appId === appId);
    if (wins.length === 0) {
      get().openApp(appId);
      return;
    }
    const top = wins[wins.length - 1];
    if (s.wm.focused === top && !s.overview) {
      // Cycle through instances first, minimize when there is only one.
      if (wins.length > 1) set({ wm: wm.focus(s.wm, wins[0]) });
      else set({ wm: wm.minimize(s.wm, top) });
      return;
    }
    set({ wm: wm.focus(s.wm, top), overview: false, appGrid: false });
  },

  setOverview: (overview) => {
    if (overview && !get().overview && !get().appGrid) rememberOpener();
    set({ overview, appGrid: false, menu: null });
  },
  setAppGrid: (appGrid) => {
    if (appGrid && !get().overview && !get().appGrid) rememberOpener();
    set({ appGrid, overview: false, menu: null });
  },
  setMenu: (menu) => set({ menu }),

  updateSettings: (p) => {
    const settings = { ...get().settings, ...p };
    writeJSON('local', 'portfolio.settings', settings);
    set({ settings });
  },

  notify: (n) => {
    const note: Note = { ...n, id: noteId++, time: Date.now() };
    // Phones: never cover content with a banner; notifications still collect in the list.
    const dnd = get().settings.dnd || get().mobile;
    set((s) => ({ notes: [note, ...s.notes].slice(0, 20), banner: dnd ? s.banner : note }));
    if (!dnd) {
      sound.play('notify');
      window.clearTimeout(bannerTimer);
      bannerTimer = window.setTimeout(() => set({ banner: null }), 5500);
    }
  },
  dismissBanner: () => {
    window.clearTimeout(bannerTimer);
    set({ banner: null });
  },
  clearNotes: () => set({ notes: [] }),

  logout: () => set({ session: 'login', wm: wm.emptyWM, overview: false, appGrid: false, menu: null, banner: null }),
}));

/** Topmost visible window id for an app, used by the dock and overview. */
export function appWindows(state: wm.WMState, appId: AppId): string[] {
  return state.order.filter((id) => state.windows[id].appId === appId);
}
