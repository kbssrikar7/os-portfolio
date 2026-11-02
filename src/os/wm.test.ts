import { describe, expect, it } from 'vitest';
import {
  clampRect, close, effectiveRect, emptyWM, fitAll, focus, minimize, open, setRect, snapZone, toggleMaximize,
  unsnapRect, type OpenSpec,
} from './wm';

const area = { x: 64, y: 32, w: 1376, h: 868 };
const about: OpenSpec = { appId: 'about', size: { w: 800, h: 600 }, min: { w: 360, h: 300 } };
const term: OpenSpec = { appId: 'terminal', size: { w: 700, h: 440 }, min: { w: 320, h: 200 }, multi: true };

describe('window manager', () => {
  it('opens a window focused on top', () => {
    const { state, id } = open(emptyWM, about, area);
    expect(state.focused).toBe(id);
    expect(state.order).toEqual(['about']);
    expect(state.windows.about.mode).toBe('normal');
  });

  it('singleton apps refocus and restore instead of duplicating', () => {
    let s = open(emptyWM, about, area).state;
    s = open(s, term, area).state;
    s = minimize(s, 'about');
    const r = open(s, { ...about, payload: 'x' }, area);
    expect(Object.keys(r.state.windows)).toHaveLength(2);
    expect(r.state.windows.about.minimized).toBe(false);
    expect(r.state.windows.about.payload).toBe('x');
    expect(r.state.order.at(-1)).toBe('about');
  });

  it('multi-instance apps get unique ids', () => {
    let s = open(emptyWM, term, area).state;
    s = open(s, term, area).state;
    expect(s.order).toEqual(['terminal', 'terminal-2']);
  });

  it('minimize and close hand focus to the next visible window', () => {
    let s = open(emptyWM, about, area).state;
    s = open(s, term, area).state;
    s = minimize(s, 'terminal');
    expect(s.focused).toBe('about');
    s = minimize(s, 'about');
    expect(s.focused).toBeNull();
    s = focus(s, 'terminal');
    s = close(s, 'terminal');
    expect(s.focused).toBeNull();
  });

  it('closing a background window keeps the current focus', () => {
    let s = open(emptyWM, about, area).state;
    s = open(s, term, area).state;
    s = close(s, 'about');
    expect(s.focused).toBe('terminal');
  });

  it('maximize toggles and preserves the normal rect', () => {
    let s = open(emptyWM, about, area).state;
    const before = s.windows.about.rect;
    s = toggleMaximize(s, 'about');
    expect(effectiveRect(s.windows.about, area)).toEqual(area);
    s = toggleMaximize(s, 'about');
    expect(s.windows.about.rect).toEqual(before);
  });

  it('never lets a window leave reach', () => {
    const r = clampRect({ x: -5000, y: -300, w: 9000, h: 100 }, area, { w: 300, h: 200 });
    expect(r.w).toBe(area.w);
    expect(r.h).toBe(200);
    expect(r.x + r.w).toBeGreaterThanOrEqual(area.x + 96);
    expect(r.y).toBe(area.y);
    const far = clampRect({ x: 99999, y: 99999, w: 400, h: 300 }, area, { w: 300, h: 200 });
    expect(far.x).toBeLessThanOrEqual(area.x + area.w - 96);
    expect(far.y).toBeLessThanOrEqual(area.y + area.h - 48);
  });

  it('setRect enforces min size and leaves snapped mode', () => {
    let s = open(emptyWM, about, area).state;
    s = toggleMaximize(s, 'about');
    s = setRect(s, 'about', { x: 200, y: 100, w: 10, h: 10 }, area);
    expect(s.windows.about.mode).toBe('normal');
    expect(s.windows.about.rect.w).toBe(360);
    expect(s.windows.about.rect.h).toBe(300);
  });

  it('detects snap zones at edges', () => {
    expect(snapZone(70, 400, area)).toBe('left');
    expect(snapZone(1435, 400, area)).toBe('right');
    expect(snapZone(700, 33, area)).toBe('maximized');
    expect(snapZone(700, 400, area)).toBeNull();
  });

  it('unsnap keeps the grab point proportional', () => {
    const s = open(emptyWM, about, area).state;
    const win = s.windows.about;
    const r = unsnapRect(win, { x: 64, y: 32, w: 1376, h: 868 }, 64 + 688, 40);
    expect(r.w).toBe(win.rect.w);
    expect(Math.round(r.x + r.w / 2)).toBe(752);
  });

  it('fitAll pulls windows back after a viewport shrink', () => {
    let s = open(emptyWM, about, area).state;
    s = setRect(s, 'about', { x: 1200, y: 700, w: 800, h: 600 }, area);
    const small = { x: 64, y: 32, w: 700, h: 500 };
    s = fitAll(s, small);
    const r = s.windows.about.rect;
    expect(r.w).toBeLessThanOrEqual(700);
    expect(r.x).toBeLessThanOrEqual(small.x + small.w - 96);
  });

  it('opens new windows fully inside the work area, even when cascaded', () => {
    const short = { x: 64, y: 32, w: 1432, h: 695 };
    let s = emptyWM;
    for (let i = 0; i < 7; i++) s = open(s, { ...term, size: { w: 860, h: 820 } }, short).state;
    for (const w of Object.values(s.windows)) {
      expect(w.rect.y).toBeGreaterThanOrEqual(short.y);
      expect(w.rect.y + w.rect.h).toBeLessThanOrEqual(short.y + short.h);
      expect(w.rect.x + w.rect.w).toBeLessThanOrEqual(short.x + short.w);
    }
  });

  it('cascades a new window from the one in front so the window behind stays identifiable', () => {
    let s = open(emptyWM, about, area).state;
    const a = s.windows.about.rect;
    s = open(s, { appId: 'projects', size: { w: 1120, h: 720 }, min: { w: 400, h: 360 } }, area).state;
    const p = s.windows.projects.rect;
    expect(p.x).toBe(a.x + 28);
    expect(p.y).toBe(a.y + 28);
    expect(p.y + p.h).toBeLessThanOrEqual(area.y + area.h);
  });

  it('opens maximized on narrow screens', () => {
    const s = open(emptyWM, about, { x: 0, y: 32, w: 390, h: 760 }).state;
    expect(s.windows.about.mode).toBe('maximized');
  });
});
