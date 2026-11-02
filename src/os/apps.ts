import type { Size } from './wm';

export type AppId = 'about' | 'projects' | 'resume' | 'contact' | 'terminal' | 'opensource' | 'typing' | 'settings';

export type AppMeta = {
  id: AppId;
  name: string;
  /** Shown in overview search and the app grid tooltip. */
  description: string;
  keywords: string[];
  size: Size;
  min: Size;
  multi?: boolean;
  /** Pinned to the dock, in this order. */
  dock: boolean;
};

export const APPS: AppMeta[] = [
  { id: 'about', name: 'About Me', description: 'Who K.B.S Srikar is, experience and education', keywords: ['bio', 'profile', 'experience', 'education', 'skills', 'whoami'], size: { w: 920, h: 640 }, min: { w: 380, h: 340 }, dock: true },
  { id: 'projects', name: 'Projects', description: 'Browse 18 projects: ML, full-stack, IoT and systems', keywords: ['work', 'portfolio', 'files', 'case studies'], size: { w: 1120, h: 720 }, min: { w: 400, h: 360 }, dock: true },
  { id: 'resume', name: 'Resume', description: 'View or download the resume PDF', keywords: ['cv', 'pdf', 'document'], size: { w: 860, h: 820 }, min: { w: 360, h: 360 }, dock: true },
  { id: 'contact', name: 'Contact', description: 'Write an email or find social links', keywords: ['mail', 'email', 'hire', 'linkedin', 'message'], size: { w: 760, h: 620 }, min: { w: 360, h: 420 }, dock: true },
  { id: 'terminal', name: 'Terminal', description: 'Explore the portfolio from a shell', keywords: ['shell', 'bash', 'console', 'cli', 'command'], size: { w: 780, h: 500 }, min: { w: 340, h: 220 }, multi: true, dock: true },
  { id: 'opensource', name: 'Open Source', description: 'Merged pull requests and GitHub activity', keywords: ['github', 'contributions', 'pull requests', 'focuser'], size: { w: 860, h: 660 }, min: { w: 380, h: 360 }, dock: true },
  { id: 'typing', name: 'Typing Test', description: 'A small monkeytype-style speed test', keywords: ['game', 'wpm', 'monkeytype', 'keyboard'], size: { w: 820, h: 520 }, min: { w: 380, h: 380 }, dock: false },
  { id: 'settings', name: 'Settings', description: 'Appearance, accent colour, wallpaper, sound and motion', keywords: ['theme', 'dark', 'light', 'wallpaper', 'accent', 'preferences'], size: { w: 900, h: 640 }, min: { w: 380, h: 400 }, dock: false },
];

export const APP_BY_ID = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<AppId, AppMeta>;

export function isAppId(v: string): v is AppId {
  return v in APP_BY_ID;
}
