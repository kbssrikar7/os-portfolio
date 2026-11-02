/** The GNOME volume icon for a level, as the panel and quick settings show it. */
export function volumeIcon(volume: number, muted: boolean) {
  if (muted || volume === 0) return 'audio-volume-muted-symbolic';
  if (volume < 34) return 'audio-volume-low-symbolic';
  if (volume < 67) return 'audio-volume-medium-symbolic';
  return 'audio-volume-high-symbolic';
}
