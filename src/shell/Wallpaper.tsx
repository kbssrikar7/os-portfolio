import { useOS } from '../os/store';
import { wallpaperSrc } from './wallpapers';

/** The desktop background; follows Dark Style like GNOME 46's picture-uri / picture-uri-dark. */
export function Wallpaper({ blur = false }: { blur?: boolean }) {
  const name = useOS((s) => s.settings.wallpaper);
  const theme = useOS((s) => s.settings.theme);
  return <div className={`wallpaper ${blur ? 'wp-blur' : ''}`} style={{ backgroundImage: `url(${wallpaperSrc(name, theme)})` }} aria-hidden />;
}
