import { WALLPAPERS, type Wallpaper as W } from '../os/store';

/** Official Ubuntu 24.04 wallpapers (see public/ubuntu/ATTRIBUTION.md), each with light and dark variants. */
export const WALLPAPER_LABEL: Record<W, string> = { ubuntu: 'Ubuntu (default)', fuwafuwa: 'Fuwafuwa nanbatto san' };

export function wallpaperSrc(name: W, theme: 'dark' | 'light', thumb = false) {
  const valid = WALLPAPERS.includes(name) ? name : 'ubuntu';
  return `/ubuntu/wallpapers/${valid}-${theme}${thumb ? '-thumb' : ''}.webp`;
}
