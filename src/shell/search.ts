import { APPS, type AppId } from '../os/apps';
import { allProjects } from '../lib/projects';

export type Result = { kind: 'app' | 'project'; id: string; title: string; sub: string; app: AppId; payload?: string; icon: AppId };

function score(hay: string, q: string): number {
  const h = hay.toLowerCase();
  if (h.startsWith(q)) return 3;
  if (h.split(/[\s/+-]+/).some((w) => w.startsWith(q))) return 2;
  return h.includes(q) ? 1 : 0;
}

export function search(raw: string): Result[] {
  const q = raw.trim().toLowerCase();
  if (!q) return [];
  const apps = APPS.map((a) => ({ a, s: Math.max(score(a.name, q) * 2, ...a.keywords.map((k) => score(k, q))) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .map<Result>(({ a }) => ({ kind: 'app', id: a.id, title: a.name, sub: a.description, app: a.id, icon: a.id }));
  const projects = allProjects
    .map((p) => ({ p, s: Math.max(score(p.title, q) * 2, ...p.tech.map((t) => score(t, q)), score(p.blurb, q) > 0 ? 1 : 0) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s)
    .slice(0, 6)
    .map<Result>(({ p }) => ({ kind: 'project', id: p.slug, title: p.title, sub: p.blurb, app: 'projects', payload: p.slug, icon: 'projects' }));
  return [...apps, ...projects];
}
