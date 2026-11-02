import { useEffect, useRef, useState } from 'react';
import { useOS } from '../os/store';
import { profile } from '../data/profile';
import { Sym } from '../icons/Sym';
import { TopBar } from './TopBar';
import { PhoneGreeter } from './Phone';
import { sound } from '../os/sound';
import { fmtTime, useClock } from './useClock';

/** Owner avatar (the GitHub profile picture); initials show if the image fails to load. */
export function Avatar({ size = 128 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>
      {failed ? 'KS' : <img src="/avatar.jpg" alt="" width={size} height={size} decoding="async" onError={() => setFailed(true)} />}
    </div>
  );
}

function enterDesktop() {
  sound.play('login');
  const s = useOS.getState();
  s.setSession('desktop');
  let first = true;
  try {
    first = !window.sessionStorage.getItem('portfolio.seen');
    window.sessionStorage.setItem('portfolio.seen', '1');
  } catch { /* ignore */ }
  if (first && !location.hash.replace(/^#\/?/, '')) {
    window.setTimeout(() => s.openApp('about'), 450);
  }
}

/**
 * GDM 46 greeter as Ubuntu ships it: #222 background, a 25em user list with one
 * row (64px avatar, bold name), the orange focus ring, and the Ubuntu wordmark
 * at the bottom. The account has no password, so selecting it logs straight in,
 * which is what GDM does for a passwordless user.
 */
export function Login() {
  const mobile = useOS((s) => s.mobile);
  if (mobile) return <PhoneGreeter onUnlock={enterDesktop} />;
  return <Greeter />;
}

function Greeter() {
  const [busy, setBusy] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    btn.current?.focus();
  }, []);
  const go = () => {
    if (busy) return;
    setBusy(true);
    window.setTimeout(enterDesktop, useOS.getState().settings.reduceMotion ? 0 : 700);
  };
  return (
    <div className="greeter">
      <TopBar variant="login" />
      <div className="gdm-users" role="listbox" aria-label="Users">
        <button ref={btn} role="option" aria-selected className="gdm-user" onClick={go} aria-label={`Log in as ${profile.name}`}>
          <Avatar size={64} />
          <span className="gdm-name">{profile.name}</span>
          {busy && <span className="spinner" aria-label="Logging in" />}
        </button>
      </div>
      <img className="gdm-logo" src="/ubuntu/boot/ubuntu-logo.png" alt="Ubuntu" width={248} height={87} />
    </div>
  );
}

export function LockScreen() {
  const mobile = useOS((s) => s.mobile);
  if (mobile) return <div className="lp-lock"><PhoneGreeter onUnlock={() => useOS.getState().setSession('desktop')} /></div>;
  return <DesktopLock />;
}

function DesktopLock() {
  const now = useClock();
  const { setSession } = useOS.getState();
  useEffect(() => {
    const unlock = () => setSession('desktop');
    const t = window.setTimeout(() => {
      window.addEventListener('keydown', unlock, { once: true });
      window.addEventListener('pointerdown', unlock, { once: true });
    }, 250);
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', unlock); window.removeEventListener('pointerdown', unlock); };
  }, [setSession]);
  return (
    <div className="lock">
      <div className="lock-time">{fmtTime(now)}</div>
      <div className="lock-date">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div className="lock-hint"><Sym name="lock" /> Click or press any key to unlock</div>
    </div>
  );
}

export function PoweredOff() {
  const { setSession } = useOS.getState();
  return (
    <button className="powered-off" onClick={() => setSession('boot')}>
      <Sym name="power" size={28} />
      <span>Powered off. Click to turn it back on.</span>
    </button>
  );
}
