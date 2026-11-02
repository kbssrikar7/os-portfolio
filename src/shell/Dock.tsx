import { useState } from 'react';
import { useOS, appWindows } from '../os/store';
import { APPS, APP_BY_ID, type AppId } from '../os/apps';
import { AppIcon } from '../icons/AppIcon';
import { ContextMenu, type MenuItem } from './ContextMenu';

export function Dock() {
  const wmState = useOS((s) => s.wm);
  const appGrid = useOS((s) => s.appGrid);
  const { activateApp, setAppGrid, openApp, closeApp, focusWin } = useOS.getState();
  const [menu, setMenu] = useState<{ x: number; y: number; items: MenuItem[] } | null>(null);

  const running = new Set(Object.values(wmState.windows).map((w) => w.appId as AppId));
  const pinned = APPS.filter((a) => a.dock).map((a) => a.id);
  const extra = APPS.filter((a) => !a.dock && running.has(a.id)).map((a) => a.id);
  const focusedApp = wmState.focused ? wmState.windows[wmState.focused]?.appId : null;

  const onContext = (e: React.MouseEvent, id: AppId) => {
    e.preventDefault();
    const wins = appWindows(wmState, id);
    const meta = APP_BY_ID[id];
    const items: MenuItem[] = [
      ...wins.map((w, i) => ({ label: wins.length > 1 ? `${meta.name} ${i + 1}` : meta.name, action: () => focusWin(w) })),
      ...(wins.length ? [{ separator: true } as MenuItem] : []),
      meta.multi || !wins.length ? { label: 'New Window', action: () => openApp(id) } : null,
      wins.length ? { label: wins.length > 1 ? `Quit ${wins.length} Windows` : 'Quit', action: () => closeApp(id) } : null,
    ].filter(Boolean) as MenuItem[];
    setMenu({ x: e.clientX + 8, y: e.clientY, items });
  };

  const item = (id: AppId) => {
    const count = appWindows(wmState, id).length;
    return (
      <li key={id}>
        <button
          className={`dock-item ${focusedApp === id ? 'active' : ''}`}
          data-dock-app={id}
          aria-label={APP_BY_ID[id].name}
          onClick={() => activateApp(id)}
          onContextMenu={(e) => onContext(e, id)}
        >
          <AppIcon app={id} size={44} />
          {count > 0 && (
            <span className="dock-dots" aria-hidden>
              {Array.from({ length: Math.min(count, 4) }, (_, i) => <i key={i} />)}
            </span>
          )}
          <span className="dock-tip" role="tooltip">{APP_BY_ID[id].name}</span>
        </button>
      </li>
    );
  };

  return (
    <nav className="dock" aria-label="Dock">
      <ul className="dock-apps">
        {pinned.map(item)}
        {extra.length > 0 && <li className="dock-sep" aria-hidden />}
        {extra.map(item)}
      </ul>
      <button className={`dock-item dock-showapps ${appGrid ? 'active' : ''}`} aria-label="Show Apps" onClick={() => setAppGrid(!appGrid)}>
        <AppIcon app="grid" size={44} />
        <span className="dock-tip" role="tooltip">Show Apps</span>
      </button>
      {menu && <ContextMenu {...menu} onClose={() => setMenu(null)} />}
    </nav>
  );
}
