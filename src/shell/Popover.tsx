import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useOS } from '../os/store';

/** Top-bar dropdown shell: dismiss on outside click or Escape, focus moves in. */
export function TopPopover({ className, children, label }: { className: string; children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useOS((s) => s.settings.reduceMotion);
  useEffect(() => {
    const down = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!ref.current?.contains(t) && !t.closest('.tb-btn')) useOS.getState().setMenu(null);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && useOS.getState().setMenu(null);
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('keydown', key);
    // Focus the menu itself so keyboard users land inside it, without painting a
    // focus ring on the first control when it was opened with the mouse.
    ref.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('keydown', key);
    };
  }, []);
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      className={`popover top-popover ${className}`}
      initial={reduce ? false : { opacity: 0, y: -6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16 }}
    >
      {children}
    </motion.div>
  );
}
