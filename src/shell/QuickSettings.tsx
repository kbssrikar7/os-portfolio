import { useState } from 'react';
import { useOS, type Settings } from '../os/store';
import { Symbolic } from '../icons/Symbolic';
import { TopPopover } from './Popover';
import { volumeIcon } from './volumeIcon';

/**
 * GNOME 46 quick settings as Ubuntu 24.04 ships them: a system row (battery
 * percentage pill; Screenshot, Settings, Lock and Power buttons), the volume
 * and brightness sliders, then a two-column grid of toggles. Menu toggles
 * (Wi-Fi, Bluetooth, Power Mode) have an arrow that opens their submenu in
 * place, as in GNOME. Values come from the installed Yaru gnome-shell.css.
 */
type Sub = 'power' | 'wifi' | 'bluetooth' | 'power-mode' | null;

const POWER_MODES: { id: Settings['powerMode']; label: string }[] = [
  { id: 'performance', label: 'Performance' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'power-saver', label: 'Power Saver' },
];

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <span className="qs-slider-bin">
      <input type="range" min={0} max={100} value={value} aria-label={label} style={{ '--v': `${value}%` } as React.CSSProperties} onChange={(e) => onChange(Number(e.target.value))} />
    </span>
  );
}

function Toggle({ icon, title, subtitle, on, onClick, menu, onMenu, menuOpen }: {
  icon: string; title: string; subtitle?: string; on: boolean; onClick: () => void; menu?: boolean; onMenu?: () => void; menuOpen?: boolean;
}) {
  return (
    <div className={`qt ${menu ? 'qt-menu' : ''} ${on ? 'on' : ''}`}>
      <button className="qt-main" aria-pressed={on} onClick={onClick}>
        <Symbolic name={icon} />
        <span className="qt-text">
          <span className="qt-title">{title}</span>
          {subtitle && <span className="qt-sub">{subtitle}</span>}
        </span>
      </button>
      {menu && (
        <button className="qt-arrow" aria-label={`${title} menu`} aria-expanded={menuOpen} onClick={onMenu}>
          <Symbolic name={menuOpen ? 'pan-down-symbolic' : 'go-next-symbolic'} />
        </button>
      )}
    </div>
  );
}

function SubMenu({ icon, title, subtitle, active, children }: { icon: string; title: string; subtitle?: string; active?: boolean; children: React.ReactNode }) {
  return (
    <div className="qt-submenu">
      <div className="qt-submenu-head">
        <span className={`qt-submenu-icon ${active ? 'active' : ''}`}><Symbolic name={icon} size={24} /></span>
        <span>
          <span className="qt-submenu-title">{title}</span>
          {subtitle && <span className="qt-submenu-sub">{subtitle}</span>}
        </span>
      </div>
      <div className="qt-submenu-items">{children}</div>
    </div>
  );
}

export function QuickSettings({ variant }: { variant: 'desktop' | 'login' }) {
  const s = useOS((st) => st.settings);
  const { updateSettings, setSession, logout, openApp, setMenu } = useOS.getState();
  const [sub, setSub] = useState<Sub>(null);
  const [brightness, setBrightness] = useState(() => Math.round((Number(document.documentElement.style.getPropertyValue('--brightness')) || 1) * 100));
  const toggleSub = (k: Sub) => setSub(sub === k ? null : k);
  const vol = s.muted ? 0 : s.volume;

  const setBright = (v: number) => {
    setBrightness(v);
    document.documentElement.style.setProperty('--brightness', String(0.3 + (v / 100) * 0.7));
  };

  const grid: React.ReactNode[] = [
    <Toggle key="wifi" icon={s.wifi && !s.airplane ? 'network-wireless-signal-excellent-symbolic' : 'network-wireless-disabled-symbolic'} title="Wi-Fi" subtitle={s.wifi && !s.airplane ? 'kbs-5G' : undefined}
      on={s.wifi && !s.airplane} menu menuOpen={sub === 'wifi'} onMenu={() => toggleSub('wifi')} onClick={() => updateSettings({ wifi: !s.wifi, airplane: false })} />,
    <Toggle key="bt" icon={s.bluetooth ? 'bluetooth-active-symbolic' : 'bluetooth-disabled-symbolic'} title="Bluetooth"
      on={s.bluetooth} menu menuOpen={sub === 'bluetooth'} onMenu={() => toggleSub('bluetooth')} onClick={() => updateSettings({ bluetooth: !s.bluetooth })} />,
    <Toggle key="pm" icon="power-profile-balanced-symbolic" title="Power Mode" subtitle={POWER_MODES.find((m) => m.id === s.powerMode)?.label}
      on={s.powerMode !== 'balanced'} menu menuOpen={sub === 'power-mode'} onMenu={() => toggleSub('power-mode')}
      onClick={() => updateSettings({ powerMode: s.powerMode === 'balanced' ? 'power-saver' : 'balanced' })} />,
    <Toggle key="nl" icon="night-light-symbolic" title="Night Light" on={s.nightLight} onClick={() => updateSettings({ nightLight: !s.nightLight })} />,
    <Toggle key="dark" icon="dark-mode-symbolic" title="Dark Style" on={s.theme === 'dark'} onClick={() => updateSettings({ theme: s.theme === 'dark' ? 'light' : 'dark' })} />,
    <Toggle key="air" icon="airplane-mode-symbolic" title="Airplane Mode" on={s.airplane} onClick={() => updateSettings({ airplane: !s.airplane })} />,
  ];

  // Submenus open beneath the row that holds their toggle, like GNOME.
  const subFor = (rowIndex: number) => {
    const rowOf: Record<Exclude<Sub, null | 'power'>, number> = { wifi: 0, bluetooth: 0, 'power-mode': 1 };
    if (!sub || sub === 'power' || rowOf[sub] !== rowIndex) return null;
    if (sub === 'wifi') {
      return (
        <SubMenu key="m" icon="network-wireless-signal-excellent-symbolic" title="Wi-Fi" active={s.wifi && !s.airplane}>
          {s.wifi && !s.airplane ? (
            <button className="qs-item checked"><Symbolic name="network-wireless-signal-excellent-symbolic" /><span>kbs-5G</span><Symbolic name="object-select-symbolic" className="qs-check" /></button>
          ) : <div className="qs-empty">Wi-Fi is off</div>}
          <div className="qs-sep" />
          <button className="qs-item" onClick={() => openApp('settings')}>All Networks</button>
        </SubMenu>
      );
    }
    if (sub === 'bluetooth') {
      return (
        <SubMenu key="m" icon={s.bluetooth ? 'bluetooth-active-symbolic' : 'bluetooth-disabled-symbolic'} title="Bluetooth" active={s.bluetooth}>
          <div className="qs-empty">{s.bluetooth ? 'No Devices Found' : 'Bluetooth is off'}</div>
          <div className="qs-sep" />
          <button className="qs-item" onClick={() => openApp('settings')}>Bluetooth Settings</button>
        </SubMenu>
      );
    }
    return (
      <SubMenu key="m" icon="power-profile-balanced-symbolic" title="Power Mode" active={s.powerMode !== 'balanced'}>
        {POWER_MODES.map((m) => (
          <button key={m.id} className="qs-item" onClick={() => updateSettings({ powerMode: m.id })}>
            <span>{m.label}</span>
            {s.powerMode === m.id && <Symbolic name="object-select-symbolic" className="qs-check" />}
          </button>
        ))}
      </SubMenu>
    );
  };

  return (
    <TopPopover className="qs" label="System menu">
      <div className="qs-system">
        <button className="qs-btn qs-battery" title="Power Settings" onClick={() => variant === 'desktop' && openApp('settings')}>
          <Symbolic name="battery-level-100-charged-symbolic" />
          <span>100 %</span>
        </button>
        <span className="qs-spacer" />
        {variant === 'desktop' && (
          <>
            <button className="qs-btn qs-round" aria-label="Take Screenshot" title="Take Screenshot" onClick={() => setMenu(null)}><Symbolic name="screenshot-recorded-symbolic" /></button>
            <button className="qs-btn qs-round" aria-label="Settings" title="Settings" onClick={() => openApp('settings')}><Symbolic name="org.gnome.Settings-symbolic" /></button>
            <button className="qs-btn qs-round" aria-label="Lock" title="Lock" onClick={() => setSession('locked')}><Symbolic name="system-lock-screen-symbolic" /></button>
          </>
        )}
        <button className={`qs-btn qs-round ${sub === 'power' ? 'on' : ''}`} aria-label="Power Off / Log Out" title="Power Off / Log Out" aria-expanded={sub === 'power'} onClick={() => toggleSub('power')}>
          <Symbolic name="system-shutdown-symbolic" />
        </button>
      </div>
      {sub === 'power' && (
        <SubMenu icon="system-shutdown-symbolic" title="Power Off">
          {variant === 'desktop' && <button className="qs-item" onClick={() => setSession('locked')}>Suspend</button>}
          <button className="qs-item" onClick={() => { setMenu(null); logout(); setSession('boot'); }}>Restart…</button>
          <button className="qs-item" onClick={() => { setMenu(null); logout(); setSession('off'); }}>Power Off…</button>
          {variant === 'desktop' && (
            <>
              <div className="qs-sep" />
              <button className="qs-item" onClick={logout}>Log Out…</button>
            </>
          )}
        </SubMenu>
      )}

      <div className="qs-slider">
        <button className="qs-btn qs-round qs-slider-icon" aria-label={s.muted ? 'Unmute' : 'Mute'} onClick={() => updateSettings({ muted: !s.muted })}>
          <Symbolic name={volumeIcon(s.volume, s.muted)} />
        </button>
        <Slider value={vol} label="Volume" onChange={(v) => updateSettings({ volume: v, muted: false })} />
      </div>
      <div className="qs-slider">
        <span className="qs-round qs-slider-icon static"><Symbolic name="display-brightness-symbolic" /></span>
        <Slider value={brightness} label="Brightness" onChange={setBright} />
      </div>

      <div className="qs-grid">
        {grid.slice(0, 2)}
        {subFor(0)}
        {grid.slice(2, 4)}
        {subFor(1)}
        {grid.slice(4, 6)}
      </div>
    </TopPopover>
  );
}
