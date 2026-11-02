import { memo } from 'react';
import { About } from './About';
import { Projects } from './Projects';
import { Resume } from './Resume';
import { Contact } from './Contact';
import { Terminal } from './Terminal';
import { OpenSource } from './OpenSource';
import { Typing } from './Typing';
import { Settings } from './Settings';

/** Memoized so dragging a window (which re-renders its frame) never re-renders app content. */
export const AppContent = memo(function AppContent({ appId, payload }: { appId: string; winId: string; payload: string | null }) {
  switch (appId) {
    case 'about': return <About />;
    case 'projects': return <Projects payload={payload} />;
    case 'resume': return <Resume />;
    case 'contact': return <Contact />;
    case 'terminal': return <Terminal />;
    case 'opensource': return <OpenSource />;
    case 'typing': return <Typing />;
    case 'settings': return <Settings payload={payload} />;
    default: return null;
  }
});
