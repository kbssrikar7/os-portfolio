import { useRef, useState } from 'react';
import { useOS } from '../os/store';
import type { AppId } from '../os/apps';
import { AppIcon } from '../icons/AppIcon';
import { ContextMenu, type MenuItem } from './ContextMenu';

type Item = { key: string; label: string; icon: Parameters<typeof AppIcon>[0]['app']; app: AppId };
const ITEMS: Item[] = [
  { key: 'about', label: 'About Me', icon: 'about', app: 'about' },
  { key: 'projects', label: 'Projects', icon: 'folder', app: 'projects' },
  { key: 'resume', label: 'Resume.pdf', icon: 'pdf', app: 'resume' },
  { key: 'contact', label: 'Contact', icon: 'contact', app: 'contact' },
];

/** Desktop icons: single click selects, double click or Enter opens, drag on empty space rubber-bands. */
export function DesktopIcons() {
  const { openApp } = useOS.getState();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [band, setBand] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return;
    setSel(new Set());
    const sx = e.clientX;
    const sy = e.clientY;
    const node = e.currentTarget as HTMLElement;
    node.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = { x: Math.min(sx, ev.clientX), y: Math.min(sy, ev.clientY), w: Math.abs(ev.clientX - sx), h: Math.abs(ev.clientY - sy) };
      setBand(r);
      const hit = new Set<string>();
      root.current?.querySelectorAll<HTMLElement>('[data-icon]').forEach((el) => {
        const b = el.getBoundingClientRect();
        if (b.right > r.x && b.left < r.x + r.w && b.bottom > r.y && b.top < r.y + r.h) hit.add(el.dataset.icon!);
      });
      setSel(hit);
    };
    const up = () => {
      setBand(null);
      node.removeEventListener('pointermove', move);
      node.removeEventListener('pointerup', up);
    };
    node.addEventListener('pointermove', move);
    node.addEventListener('pointerup', up);
  };

  const items: MenuItem[] = [
    { label: 'New Terminal', action: () => openApp('terminal') },
    { separator: true },
    { label: 'Change Background...', action: () => openApp('settings', 'background') },
    { label: 'Appearance Settings', action: () => openApp('settings', 'appearance') },
    { separator: true },
    { label: 'Show Projects', action: () => openApp('projects') },
  ];

  return (
    <div
      ref={root}
      className="desktop-surface"
      onPointerDown={onDown}
      onContextMenu={(e) => {
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <ul className="desk-icons" aria-label="Desktop">
        {ITEMS.map((it) => (
          <li key={it.key}>
            <button
              data-icon={it.key}
              className={`desk-icon ${sel.has(it.key) ? 'sel' : ''}`}
              onClick={(e) => setSel(e.ctrlKey ? new Set([...sel, it.key]) : new Set([it.key]))}
              onDoubleClick={() => { openApp(it.app); setSel(new Set()); }}
              onKeyDown={(e) => e.key === 'Enter' && openApp(it.app)}
            >
              <AppIcon app={it.icon} size={56} />
              <span>{it.label}</span>
            </button>
          </li>
        ))}
      </ul>
      {band && <div className="rubber-band" style={{ left: band.x, top: band.y, width: band.w, height: band.h }} />}
      {menu && <ContextMenu {...menu} items={items} onClose={() => setMenu(null)} />}
    </div>
  );
}
