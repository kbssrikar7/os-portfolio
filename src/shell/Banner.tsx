import { AnimatePresence, motion } from 'motion/react';
import { useOS } from '../os/store';
import { AppIcon } from '../icons/AppIcon';
import { Sym } from '../icons/Sym';

export function Banner() {
  const banner = useOS((s) => s.banner);
  const reduce = useOS((s) => s.settings.reduceMotion);
  const { dismissBanner, openApp } = useOS.getState();
  return (
    <div className="banner-host" aria-live="polite">
      <AnimatePresence>
        {banner && (
          <motion.div
            key={banner.id}
            className="banner popover"
            initial={reduce ? false : { y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
          >
            <button
              className="banner-main"
              onClick={() => {
                dismissBanner();
                if (banner.app) openApp(banner.app, banner.payload);
              }}
            >
              <AppIcon app={banner.app ?? 'about'} size={32} />
              <span>
                <strong>{banner.title}</strong>
                <span>{banner.body}</span>
              </span>
            </button>
            <button className="flat-btn banner-x" aria-label="Dismiss" onClick={dismissBanner}><Sym name="close" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
