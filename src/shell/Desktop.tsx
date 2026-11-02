import { useOS } from '../os/store';
import { Wallpaper } from './Wallpaper';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { WindowLayer } from './WindowLayer';
import { Overview } from './Overview';
import { Banner } from './Banner';
import { DesktopIcons } from './DesktopIcons';
import { PhoneShell } from './Phone';

export function Desktop() {
  const mobile = useOS((s) => s.mobile);
  const overview = useOS((s) => s.overview);
  const appGrid = useOS((s) => s.appGrid);
  if (mobile) return <PhoneShell />;
  return (
    <div className={`desktop ${overview || appGrid ? 'activities' : ''}`}>
      <Wallpaper blur={overview || appGrid} />
      <DesktopIcons />
      <Overview />
      <WindowLayer />
      <Dock />
      <TopBar />
      <Banner />
    </div>
  );
}
