import { manualProjects, type ManualProject } from '../data/projects.manual';
import curated from '../data/projects.curated.json';
import previewManifest from '../../public/previews/manifest.json';

/** Ported from portfolio-src/src/lib/projects.ts so ranking, featured set and buckets match the live site. */
export type Bucket = 'client-work' | 'applied-ml' | 'full-stack' | 'embedded-iot' | 'systems-tooling';

export type Project = ManualProject & {
  repoUrl: string | null;
  score: number;
  bucket: Bucket;
  demoable: boolean;
  featured: boolean;
  preview: string | null;
  srcSet: string | null;
  hue: number;
};

export const BUCKET_LABELS: Record<Bucket, string> = {
  'client-work': 'Client Work',
  'applied-ml': 'Applied ML',
  'full-stack': 'Full-Stack',
  'embedded-iot': 'Embedded + IoT',
  'systems-tooling': 'Systems + Tooling',
};

const FEATURED_PINS = new Set(['handwritten-equation-solver', 'headphonesafety']);
const FEATURED_COUNT = 6;
const LEAD = 'libraa-website';
const LEAD_HUE = 215;
const GOLDEN_ANGLE = 137.508;

const signals = curated.projects as Record<string, { score: number; bucket: string; demoable: boolean }>;
const previews = previewManifest as Record<string, string>;

export function previewSrcSet(file: string): string {
  const base = `/previews/${file.replace(/\.webp$/, '')}`;
  return `${base}-640.webp 640w, ${base}-800.webp 800w, ${base}-1200.webp 1200w, ${base}.webp 2400w`;
}

function toBucket(value: string | undefined): Bucket {
  return value && value in BUCKET_LABELS ? (value as Bucket) : 'full-stack';
}

const merged: Project[] = manualProjects.map((m) => {
  const s = signals[m.slug];
  const file = previews[m.slug];
  return {
    ...m,
    repoUrl: m.repo === null ? null : `https://github.com/kbssrikar7/${m.repo ?? m.slug}`,
    score: s?.score ?? 0,
    bucket: m.clientWork ? 'client-work' : toBucket(s?.bucket),
    demoable: Boolean(m.liveUrl) && (s ? s.demoable : true),
    featured: false,
    preview: file ? `/previews/${file.replace(/\.webp$/, '-1200.webp')}` : m.readmeImage ?? null,
    srcSet: file ? previewSrcSet(file) : null,
    hue: 0,
  };
});

const ranked = merged.filter((p) => p.slug !== LEAD).sort((a, b) => b.score - a.score);
ranked.forEach((p, i) => {
  p.hue = Math.round((i * GOLDEN_ANGLE) % 360);
});
const lead = merged.find((p) => p.slug === LEAD);
if (lead) {
  lead.hue = LEAD_HUE;
  ranked.unshift(lead);
}
const featuredSlugs = new Set<string>([...(lead ? [LEAD] : []), ...FEATURED_PINS]);
for (const p of ranked) {
  if (featuredSlugs.size >= FEATURED_COUNT) break;
  featuredSlugs.add(p.slug);
}
for (const p of ranked) p.featured = featuredSlugs.has(p.slug);

export const allProjects: Project[] = ranked;
export const buckets: Bucket[] = Array.from(new Set(ranked.map((p) => p.bucket)));

export function getProject(slug: string): Project | undefined {
  return ranked.find((p) => p.slug === slug);
}

/** Only a working live URL is linked. A `liveNote` without a URL means the demo is retired. */
export function liveLink(p: Project): { href: string; label: string } | null {
  if (!p.liveUrl) return null;
  return { href: p.liveUrl, label: p.liveLabel ?? 'Live demo' };
}
