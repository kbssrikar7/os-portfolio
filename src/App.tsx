import { useEffect } from 'react';
import { ACCENTS, useOS } from './os/store';
import { isAppId } from './os/apps';
import { Boot } from './shell/Boot';
import { Login, LockScreen, PoweredOff } from './shell/Login';
import { Desktop } from './shell/Desktop';

/** `#/projects/healthcare-qa-chatbot` style deep links. */
function parseHash(): { app: string; payload: string | null } | null {
  const [app, ...rest] = location.hash.replace(/^#\/?/, '').split('/');
  if (!app || !isAppId(app)) return null;
  return { app, payload: rest.length ? decodeURIComponent(rest.join('/')) : null };
}

function useThemeSync() {
  const settings = useOS((s) => s.settings);
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty('--accent', ACCENTS[settings.accent]);
    root.classList.toggle('reduce-motion', settings.reduceMotion);
    root.classList.toggle('night-light', settings.nightLight);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', ACCENTS[settings.accent]);
  }, [settings]);
}

function useViewport() {
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => useOS.getState().setViewport(window.innerWidth, window.innerHeight));
    };
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
}

function useHashRouting() {
  const session = useOS((s) => s.session);
  const focused = useOS((s) => (s.wm.focused ? s.wm.windows[s.wm.focused] : null));
  // Store -> URL
  useEffect(() => {
    if (session !== 'desktop') return;
    const hash = focused ? `#/${focused.appId}${focused.payload ? `/${encodeURIComponent(focused.payload)}` : ''}` : '';
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname);
  }, [session, focused]);
  // URL -> store (back/forward, pasted links)
  useEffect(() => {
    const on = () => {
      const r = parseHash();
      if (r && useOS.getState().session === 'desktop') useOS.getState().openApp(r.app as never, r.payload);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
}

/** Clicks inside an iframe (the PDF viewer) never reach our handlers; the page blurs instead. */
function useIframeFocus() {
  useEffect(() => {
    const onBlur = () => {
      window.setTimeout(() => {
        const a = document.activeElement;
        if (a?.tagName !== 'IFRAME') return;
        const id = (a.closest('[data-win-id]') as HTMLElement | null)?.dataset.winId;
        if (id) useOS.getState().focusWin(id);
      }, 0);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, []);
}

function useShortcuts() {
  useEffect(() => {
    let superDown = false;
    const down = (e: KeyboardEvent) => {
      const s = useOS.getState();
      if (s.session !== 'desktop') return;
      if (e.key === 'Meta' || e.key === 'OS') { superDown = true; return; }
      superDown = false;
      if (e.key === 'Escape') {
        if (s.menu) s.setMenu(null);
        else if (s.overview || s.appGrid) s.setOverview(false);
        return;
      }
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') { e.preventDefault(); s.openApp('terminal'); }
      // GNOME: typing on an empty desktop starts an Activities search.
      const target = e.target as HTMLElement;
      const typing = target.closest('input, textarea, [contenteditable], .term');
      if (!typing && !s.overview && !s.appGrid && !s.mobile && !e.ctrlKey && !e.metaKey && !e.altKey && /^[a-z0-9]$/i.test(e.key) && !s.wm.focused) {
        s.setOverview(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if ((e.key === 'Meta' || e.key === 'OS') && superDown) {
        superDown = false;
        const s = useOS.getState();
        if (s.session === 'desktop') s.setOverview(!s.overview);
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);
}

/** Guards the one-time startup routing against StrictMode's double effect run. */
let booted = false;

export default function App() {
  const session = useOS((s) => s.session);
  useThemeSync();
  useViewport();
  useHashRouting();
  useShortcuts();
  useIframeFocus();

  // First paint: a deep link or a returning visitor in this tab skips straight to the desktop.
  useEffect(() => {
    if (booted) return;
    booted = true;
    const r = parseHash();
    let seen = false;
    try { seen = Boolean(window.sessionStorage.getItem('portfolio.seen')); } catch { /* ignore */ }
    if (r || seen) {
      try { window.sessionStorage.setItem('portfolio.seen', '1'); } catch { /* ignore */ }
      const s = useOS.getState();
      s.setSession('desktop');
      s.openApp(r ? (r.app as never) : 'about', r?.payload ?? null);
    }
  }, []);

  return (
    <div className="os-root">
      {session === 'boot' && <Boot />}
      {session === 'login' && <Login />}
      {(session === 'desktop' || session === 'locked') && <Desktop />}
      {session === 'locked' && <LockScreen />}
      {session === 'off' && <PoweredOff />}
    </div>
  );
}
