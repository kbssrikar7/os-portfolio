/** GNOME-style symbolic icons: 16px grid, 1.5px strokes, currentColor. Original drawings. */
const P: Record<string, React.ReactNode> = {
  close: <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />,
  minimize: <path d="M4.5 11h7" />,
  maximize: <rect x="4" y="4" width="8" height="8" rx="1.2" />,
  restore: (
    <>
      <rect x="3.5" y="5.5" width="7" height="7" rx="1.2" />
      <path d="M6 3.5h5.3c.7 0 1.2.5 1.2 1.2V10" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2L13.5 13.5" />
    </>
  ),
  back: <path d="M10 3.5L5.5 8l4.5 4.5" />,
  forward: <path d="M6 3.5L10.5 8 6 12.5" />,
  down: <path d="M3.5 6L8 10.5 12.5 6" />,
  grid: (
    <>
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </>
  ),
  list: <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />,
  wifi: (
    <>
      <path d="M1.8 6.2a9 9 0 0112.4 0M4 8.6a6 6 0 018 0M6.2 11a3 3 0 013.6 0" />
      <circle cx="8" cy="13.2" r=".6" fill="currentColor" />
    </>
  ),
  volume: (
    <>
      <path d="M2.5 6v4h2.5l3.5 3V3L5 6z" fill="currentColor" stroke="none" />
      <path d="M10.5 5.5a3.5 3.5 0 010 5M12.3 3.6a6 6 0 010 8.8" />
    </>
  ),
  muted: (
    <>
      <path d="M2.5 6v4h2.5l3.5 3V3L5 6z" fill="currentColor" stroke="none" />
      <path d="M10.5 6l3.5 4M14 6l-3.5 4" />
    </>
  ),
  battery: (
    <>
      <rect x="1.5" y="4.5" width="11.5" height="7" rx="1.5" />
      <rect x="3" y="6" width="7" height="4" rx=".5" fill="currentColor" stroke="none" />
      <path d="M14.5 6.8v2.4" />
    </>
  ),
  power: <path d="M8 2v5.5M4.6 4.2a5 5 0 106.8 0" />,
  lock: (
    <>
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.3" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
    </>
  ),
  gear: (
    <>
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.8v1.6M8 12.6v1.6M14.2 8h-1.6M3.4 8H1.8M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1M12.4 12.4l-1.1-1.1M4.7 4.7L3.6 3.6" />
    </>
  ),
  moon: <path d="M12.8 10.2A5.5 5.5 0 015.8 3.2a5.5 5.5 0 107 7z" />,
  sun: (
    <>
      <circle cx="8" cy="8" r="2.8" />
      <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1 1M4.4 11.6l-1 1M12.6 12.6l-1-1M4.4 4.4l-1-1" />
    </>
  ),
  bell: (
    <>
      <path d="M4 11V7a4 4 0 018 0v4l1.2 1.5H2.8z" />
      <path d="M6.6 14h2.8" />
    </>
  ),
  bellOff: (
    <>
      <path d="M4 11V7a4 4 0 016.8-2.9M12 7v4l1.2 1.5H5" />
      <path d="M2.5 13.5l11-11" />
    </>
  ),
  motion: <path d="M2 8c2-4 4-4 6 0s4 4 6 0" />,
  external: (
    <>
      <path d="M9 2.5h4.5V7M13.5 2.5L7.5 8.5" />
      <path d="M12 9.5v3a1 1 0 01-1 1H3.5a1 1 0 01-1-1V5a1 1 0 011-1h3" />
    </>
  ),
  download: (
    <>
      <path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5" />
      <path d="M2.5 13.5h11" />
    </>
  ),
  copy: (
    <>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.3" />
      <path d="M10.5 3.5V3a.9.9 0 00-.9-.9H3.4a.9.9 0 00-.9.9v6.2c0 .5.4.9.9.9h.6" />
    </>
  ),
  check: <path d="M3 8.5l3 3 7-7" />,
  send: <path d="M2.5 8L14 2.5 10.5 14 8 9.5zM8 9.5l6-7" />,
  mail: (
    <>
      <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
      <path d="M2.5 4.5L8 9l5.5-4.5" />
    </>
  ),
  github: (
    <path
      d="M8 1.5a6.5 6.5 0 00-2 12.7c.3 0 .4-.1.4-.3v-1.2c-1.8.4-2.2-.8-2.2-.8-.3-.8-.7-1-.7-1-.6-.4 0-.4 0-.4.6 0 1 .7 1 .7.6 1 1.5.7 1.9.5 0-.4.2-.7.4-.9-1.4-.2-3-.7-3-3.2 0-.7.3-1.3.7-1.7-.1-.2-.3-.8 0-1.7 0 0 .6-.2 1.8.7a6 6 0 013.2 0c1.2-.9 1.8-.7 1.8-.7.3.9.1 1.5 0 1.7.4.4.7 1 .7 1.7 0 2.5-1.6 3-3 3.2.2.2.4.6.4 1.2v1.8c0 .2.1.4.4.3A6.5 6.5 0 008 1.5z"
      fill="currentColor"
      stroke="none"
    />
  ),
  linkedin: (
    <>
      <rect x="2" y="2" width="12" height="12" rx="2.5" />
      <path d="M5.2 7.2v3.8M5.2 5v.1M7.8 11V7.2m0 1.9c0-1.1.7-1.9 1.6-1.9.9 0 1.5.7 1.5 1.9V11" />
    </>
  ),
  x: <path d="M3 2.5h2.6l7.4 11H10.4zM12.8 2.5L8.9 7M3.2 13.5L7.1 9" />,
  hf: (
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="6" cy="7" r=".7" fill="currentColor" />
      <circle cx="10" cy="7" r=".7" fill="currentColor" />
      <path d="M5.5 9.6c1.3 1.6 3.7 1.6 5 0" />
    </>
  ),
  keyboard: (
    <>
      <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
      <path d="M4 6.5h.1M6.5 6.5h.1M9 6.5h.1M11.5 6.5h.1M5 9.5h6" />
    </>
  ),
  star: <path d="M8 2l1.8 3.8 4.2.5-3.1 2.9.8 4.1L8 11.3l-3.7 2 .8-4.1L2 6.3l4.2-.5z" />,
  folder: <path d="M2 4.5c0-.6.4-1 1-1h3.3l1.4 1.5H13c.6 0 1 .4 1 1V12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1z" />,
  sparkle: <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4 4l1.8 1.8M10.2 10.2L12 12M12 4l-1.8 1.8M5.8 10.2L4 12" />,
  pr: (
    <>
      <circle cx="4.5" cy="3.5" r="1.6" />
      <circle cx="4.5" cy="12.5" r="1.6" />
      <circle cx="11.5" cy="12.5" r="1.6" />
      <path d="M4.5 5.1v5.8M11.5 10.9V6.5c0-1.1-.9-2-2-2H7.5M9 3l-1.5 1.5L9 6" />
    </>
  ),
  calendar: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7.2v4M8 4.8v.1" />
    </>
  ),
  zoomIn: (
    <>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2l3.3 3.3M5 7h4M7 5v4" />
    </>
  ),
  zoomOut: (
    <>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2l3.3 3.3M5 7h4" />
    </>
  ),
  menu: <path d="M3 4.5h10M3 8h10M3 11.5h10" />,
  refresh: (
    <>
      <path d="M13 8a5 5 0 11-1.5-3.6" />
      <path d="M12 2v3h-3" />
    </>
  ),
  location: (
    <>
      <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 00-9 0C3.5 9.8 8 14 8 14z" />
      <circle cx="8" cy="6.5" r="1.6" />
    </>
  ),
  school: (
    <>
      <path d="M1.5 6L8 3l6.5 3L8 9z" />
      <path d="M4 7.3v3.4c1 1 2.4 1.6 4 1.6s3-.6 4-1.6V7.3M14.5 6v4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="5" width="12" height="8.5" rx="1.5" />
      <path d="M5.5 5V3.8c0-.7.5-1.3 1.3-1.3h2.4c.8 0 1.3.6 1.3 1.3V5M2 9h12" />
    </>
  ),
};

export type SymName = keyof typeof P;

export function Sym({ name, size = 16, className, label }: { name: SymName | string; size?: number; className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {P[name]}
    </svg>
  );
}
