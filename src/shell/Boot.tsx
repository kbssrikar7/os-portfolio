import { useCallback, useEffect, useState } from 'react';
import { useOS } from '../os/store';

/**
 * Ubuntu 24.04 boot: the GRUB 2.12 menu, then the Plymouth "bgrt" splash.
 *
 * GRUB colours follow Ubuntu's defaults (menu_color_normal=white/black,
 * menu_color_highlight=black/light-gray). The splash places the logo, the
 * spinner (the real Plymouth throbber frames) and the Ubuntu watermark at the
 * vertical alignments in /usr/share/plymouth/themes/bgrt/bgrt.plymouth.
 */
const KERNEL = '6.8.0-48-generic';
const TIMEOUT = 5;

type Menu = 'main' | 'advanced';
const MAIN = ['Ubuntu', 'Advanced options for Ubuntu'];
const ADVANCED = [`Ubuntu, with Linux ${KERNEL}`, `Ubuntu, with Linux ${KERNEL} (recovery mode)`];

function Grub({ onBoot }: { onBoot: () => void }) {
  const [menu, setMenu] = useState<Menu>('main');
  const [sel, setSel] = useState(0);
  const [count, setCount] = useState<number | null>(TIMEOUT);
  const entries = menu === 'main' ? MAIN : ADVANCED;

  const activate = useCallback(
    (i: number) => {
      if (menu === 'main' && i === 1) {
        setMenu('advanced');
        setSel(0);
        setCount(null);
        return;
      }
      onBoot();
    },
    [menu, onBoot],
  );

  // GRUB's countdown stops for good at the first key press.
  useEffect(() => {
    if (count === null) return;
    const t = window.setTimeout(() => (count <= 1 ? activate(sel) : setCount(count - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [count, sel, activate]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      setCount(null);
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(entries.length - 1, s + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
      else if (e.key === 'Home') setSel(0);
      else if (e.key === 'End') setSel(entries.length - 1);
      else if (e.key === 'Enter') activate(sel);
      else if (e.key === 'Escape' && menu === 'advanced') { setMenu('main'); setSel(1); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [entries.length, sel, menu, activate]);

  return (
    <div className="grub" role="dialog" aria-label="GNU GRUB boot menu">
      <div className="grub-title">GNU GRUB  version 2.12</div>
      <ul className="grub-box" role="listbox" aria-label="Boot entries">
        {entries.map((label, i) => (
          <li key={label} role="option" aria-selected={i === sel}>
            <button
              className={i === sel ? 'sel' : ''}
              onPointerEnter={() => setSel(i)}
              onClick={() => { setCount(null); setSel(i); activate(i); }}
            >
              {i === sel ? '*' : ' '}{label}
            </button>
          </li>
        ))}
      </ul>
      <div className="grub-help">
        <p>     Use the ▲ and ▼ keys to select which entry is highlighted.</p>
        <p>     Press enter to boot the selected OS, `e' to edit the commands</p>
        <p>     before booting or `c' for a command-line.{menu === 'advanced' && ' ESC to return'}</p>
        {menu === 'advanced' && <p>     previous menu.</p>}
        {count !== null && <p>  The highlighted entry will be executed automatically in {count}s.</p>}
      </div>
    </div>
  );
}

function Splash() {
  const reduce = useOS((s) => s.settings.reduceMotion);
  useEffect(() => {
    const done = () => useOS.getState().setSession('login');
    const t = window.setTimeout(done, reduce ? 300 : 2600);
    // Skippable, but not by the same key press that left GRUB.
    const arm = window.setTimeout(() => {
      window.addEventListener('keydown', done);
      window.addEventListener('pointerdown', done);
    }, 400);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(arm);
      window.removeEventListener('keydown', done);
      window.removeEventListener('pointerdown', done);
    };
  }, [reduce]);

  return (
    <div className="plymouth" aria-label="Starting Ubuntu">
      <img className="ply-logo" src="/ubuntu/boot/bgrt-fallback.png" alt="" width={128} height={128} />
      <span className="ply-throbber" aria-hidden />
      <img className="ply-watermark" src="/ubuntu/boot/ubuntu-logo.png" alt="Ubuntu" width={248} height={87} />
    </div>
  );
}

export function Boot() {
  const [stage, setStage] = useState<'grub' | 'splash'>('grub');
  const mobile = useOS((s) => s.mobile);
  // Phones have no GRUB or Plymouth to show; Ubuntu Touch starts at its greeter.
  useEffect(() => {
    // Only from a real boot: a deep link may already have moved the session on.
    if (mobile && useOS.getState().session === 'boot') useOS.getState().setSession('login');
  }, [mobile]);
  if (mobile) return null;
  return stage === 'grub' ? <Grub onBoot={() => setStage('splash')} /> : <Splash />;
}
