import type { AppId } from '../os/apps';

/**
 * Official Yaru icons (CC BY-SA 4.0, see public/ubuntu/ATTRIBUTION.md). Each
 * portfolio app uses the icon of the Ubuntu app it stands in for: Projects is a
 * Files window, Resume is Document Viewer, Contact is a mail client.
 */
type IconName = AppId | 'grid' | 'trash' | 'folder' | 'pdf' | 'home' | 'text';

const SRC: Record<Exclude<IconName, 'grid'>, string> = {
  about: 'avatar-default',
  projects: 'files',
  resume: 'document-viewer',
  contact: 'mail',
  terminal: 'terminal',
  opensource: 'developer',
  typing: 'keyboard',
  settings: 'settings',
  trash: 'user-trash',
  folder: 'folder',
  pdf: 'application-pdf',
  home: 'user-home',
  text: 'text-x-generic',
};

export function AppIcon({ app, size = 48, className }: { app: IconName; size?: number; className?: string }) {
  if (app === 'grid') {
    // Ubuntu Dock's "Show Apps" glyph: the Yaru symbolic grid, drawn in the current text colour.
    return (
      <span
        className={`icon-grid ${className ?? ''}`}
        style={{ width: size * 0.6, height: size * 0.6, display: 'inline-block' }}
        aria-hidden
      />
    );
  }
  return <img className={className} src={`/ubuntu/icons/${SRC[app]}.png`} width={size} height={size} alt="" draggable={false} decoding="async" />;
}
