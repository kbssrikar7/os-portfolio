import { useOS, ACCENTS, WALLPAPERS, type Accent } from '../os/store';
import { HeaderBar } from '../shell/HeaderBar';
import { useWin } from '../shell/winContext';
import { WALLPAPER_LABEL, wallpaperSrc } from '../shell/wallpapers';
import { Sym } from '../icons/Sym';
import { profile } from '../data/profile';

const PAGES = [
  { id: 'appearance', label: 'Appearance', icon: 'sun' },
  { id: 'background', label: 'Background', icon: 'grid' },
  { id: 'sound', label: 'Sound', icon: 'volume' },
  { id: 'accessibility', label: 'Accessibility', icon: 'motion' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'about', label: 'About', icon: 'info' },
] as const;
type Page = (typeof PAGES)[number]['id'];


export function Settings({ payload }: { payload: string | null }) {
  const { winId } = useWin();
  const s = useOS((st) => st.settings);
  const { updateSettings, setPayload } = useOS.getState();
  const page: Page = (PAGES.find((p) => p.id === payload)?.id ?? 'appearance') as Page;
  const title = PAGES.find((p) => p.id === page)!.label;

  return (
    <div className="settings">
      <HeaderBar title={<span className="hb-title-text">{title}</span>} />
      <aside className="sidebar" aria-label="Settings pages">
        {PAGES.map((p) => (
          <button key={p.id} className={`sb-item ${page === p.id ? 'on' : ''}`} onClick={() => setPayload(winId, p.id)}>
            <Sym name={p.icon} /> <span>{p.label}</span>
          </button>
        ))}
      </aside>
      <div className="settings-main scroll">
        <div className="chips-scroller">
          {PAGES.map((p) => <button key={p.id} className={`chip-btn ${page === p.id ? 'on' : ''}`} onClick={() => setPayload(winId, p.id)}>{p.label}</button>)}
        </div>
        {page === 'appearance' && (
          <>
            <h3 className="group-title">Style</h3>
            <div className="boxed style-pick">
              {(['light', 'dark'] as const).map((t) => (
                <button key={t} className={`style-opt ${s.theme === t ? 'on' : ''}`} onClick={() => updateSettings({ theme: t })} aria-pressed={s.theme === t}>
                  <span className={`style-thumb st-${t}`}><i /><i /></span>
                  <span>{t === 'light' ? 'Default' : 'Dark'}</span>
                </button>
              ))}
            </div>
            <h3 className="group-title">Colour</h3>
            <div className="boxed accents">
              {(Object.keys(ACCENTS) as Accent[]).map((a) => (
                <button key={a} className={`accent-dot ${s.accent === a ? 'on' : ''}`} style={{ background: ACCENTS[a] }} aria-label={a} aria-pressed={s.accent === a} title={a} onClick={() => updateSettings({ accent: a })}>
                  {s.accent === a && <Sym name="check" />}
                </button>
              ))}
            </div>
          </>
        )}
        {page === 'background' && (
          <div className="wp-grid">
            {WALLPAPERS.map((w) => (
              <button key={w} className={`wp-opt ${s.wallpaper === w ? 'on' : ''}`} onClick={() => updateSettings({ wallpaper: w })} aria-pressed={s.wallpaper === w}>
                <img className="wp-thumb" src={wallpaperSrc(w, s.theme, true)} alt="" width={240} height={150} />
                <span>{WALLPAPER_LABEL[w]}</span>
              </button>
            ))}
          </div>
        )}
        {page === 'sound' && (
          <div className="boxed rows">
            <div className="row">
              <span>Output volume</span>
              <input type="range" min={0} max={100} value={s.volume} style={{ '--v': `${s.volume}%` } as React.CSSProperties} aria-label="Volume" onChange={(e) => updateSettings({ volume: Number(e.target.value) })} />
            </div>
            <label className="row"><span>Mute system sounds</span><input type="checkbox" className="switch" checked={s.muted} onChange={() => updateSettings({ muted: !s.muted })} /></label>
            <p className="row-note">Sounds are synthesized in your browser: a login chime and a soft notification ping.</p>
          </div>
        )}
        {page === 'accessibility' && (
          <div className="boxed rows">
            <label className="row"><span>Reduce animation<small>Turns off window, overview and boot animations</small></span><input type="checkbox" className="switch" checked={s.reduceMotion} onChange={() => updateSettings({ reduceMotion: !s.reduceMotion })} /></label>
          </div>
        )}
        {page === 'notifications' && (
          <div className="boxed rows">
            <label className="row"><span>Do Not Disturb<small>Banners stay quiet; notifications still collect in the calendar menu</small></span><input type="checkbox" className="switch" checked={s.dnd} onChange={() => updateSettings({ dnd: !s.dnd })} /></label>
          </div>
        )}
        {page === 'about' && (
          <>
            <div className="sys-hero">
              <img src={s.theme === 'dark' ? '/ubuntu/boot/ubuntu-logo-text-dark.png' : '/ubuntu/boot/ubuntu-logo-text.png'} alt="Ubuntu" width={256} height={89} />
            </div>
            <div className="boxed rows">
              <div className="row"><span>Device Name</span><span>ubuntu</span></div>
              <div className="row"><span>Operating System</span><span>Ubuntu 24.04 LTS</span></div>
              <div className="row"><span>GNOME Version</span><span>46</span></div>
              <div className="row"><span>Owner</span><span>{profile.name}</span></div>
              <div className="row"><span>Built With</span><span>React 19, TypeScript, Vite, Zustand, Motion</span></div>
              <div className="row"><span>Shortcuts</span><span>Top-left corner or Super: Activities · Esc: close overlays</span></div>
            </div>
            <p className="row-note">Yaru icons and Ubuntu wallpapers are used under CC BY-SA. Ubuntu is a trademark of Canonical Ltd. This personal portfolio is not affiliated with Canonical.</p>
          </>
        )}
      </div>
    </div>
  );
}
