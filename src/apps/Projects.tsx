import { useMemo, useRef, useState } from 'react';
import { allProjects, buckets, BUCKET_LABELS, getProject, liveLink, type Bucket, type Project } from '../lib/projects';
import { useOS } from '../os/store';
import { HeaderBar } from '../shell/HeaderBar';
import { useWin } from '../shell/winContext';
import { Sym } from '../icons/Sym';
import { TechChip } from './ui';

type Place = 'all' | 'featured' | 'live' | Bucket;

const PLACE_ICON: Record<Place, string> = {
  all: 'grid',
  featured: 'star',
  live: 'external',
  'client-work': 'briefcase',
  'applied-ml': 'sparkle',
  'full-stack': 'list',
  'embedded-iot': 'wifi',
  'systems-tooling': 'keyboard',
};

const PLACE_LABEL = (p: Place) => (p === 'all' ? 'All Projects' : p === 'featured' ? 'Featured' : p === 'live' ? 'Live Demos' : BUCKET_LABELS[p]);

function filterBy(place: Place, q: string): Project[] {
  const needle = q.trim().toLowerCase();
  return allProjects.filter((p) => {
    if (place === 'featured' && !p.featured) return false;
    if (place === 'live' && !p.demoable) return false;
    if (place !== 'all' && place !== 'featured' && place !== 'live' && p.bucket !== place) return false;
    if (!needle) return true;
    return [p.title, p.blurb, ...p.tech].some((s) => s.toLowerCase().includes(needle));
  });
}

export function Cover({ p, sizes = '(max-width: 700px) 100vw, 360px' }: { p: Project; sizes?: string }) {
  if (p.preview) {
    return <img className="cover-img" src={p.preview} srcSet={p.srcSet ?? undefined} sizes={sizes} alt={`${p.title} screenshot`} loading="lazy" decoding="async" />;
  }
  return (
    <div className="gen-cover" style={{ '--h': p.hue } as React.CSSProperties} aria-hidden>
      <span className="gen-bucket">{BUCKET_LABELS[p.bucket]}</span>
      <span className="gen-title">{p.title}</span>
      <span className="gen-tech">{p.tech.slice(0, 3).join('  ·  ')}</span>
    </div>
  );
}

/** Card hierarchy follows the reference: image first, title second, one metadata line third. */
function Card({ p, onOpen, list }: { p: Project; onOpen: () => void; list: boolean }) {
  const status = p.clientWork ? 'Client' : p.demoable ? 'Live' : p.liveNote ? 'Archived' : null;
  return (
    <button className={list ? 'p-row' : 'p-card'} onClick={onOpen}>
      <div className="p-thumb">
        <Cover p={p} sizes={list ? '120px' : undefined} />
        {status && !list && <span className={`p-badge ${status.toLowerCase()}`}>{status}</span>}
      </div>
      <div className="p-info">
        <span className="p-title">{p.title}</span>
        <span className="p-meta">{BUCKET_LABELS[p.bucket]} · {p.tech.slice(0, 3).join(', ')}</span>
        {list && <span className="p-blurb">{p.blurb}</span>}
      </div>
    </button>
  );
}

/**
 * Detail: the work fills the first screen. Title and actions sit on the media,
 * a compact title row carries the category, and a label/value panel holds the
 * brief before the longer write-up.
 */
function Detail({ p, onNav }: { p: Project; onNav: (slug: string) => void }) {
  const live = liveLink(p);
  const idx = allProjects.indexOf(p);
  const prev = allProjects[(idx - 1 + allProjects.length) % allProjects.length];
  const next = allProjects[(idx + 1) % allProjects.length];
  return (
    <article className="p-detail">
      <div className="pd-media">
        <Cover p={p} sizes="(max-width: 900px) 100vw, 900px" />
        <div className="pd-media-top"><span>{p.title}</span></div>
        <div className="pd-media-bottom">
          {p.preview ? (
            <a className="pd-chip" href={p.preview.replace('-1200.webp', '.webp')} target="_blank" rel="noreferrer"><Sym name="external" size={14} /> Full-size screenshot</a>
          ) : <span />}
          <span className="pd-media-actions">
            {live && <a className="pd-chip" href={live.href} target="_blank" rel="noreferrer"><Sym name="external" size={14} /> {live.label}</a>}
            {p.repoUrl && <a className="pd-chip" href={p.repoUrl} target="_blank" rel="noreferrer"><Sym name="github" size={14} /> Source</a>}
          </span>
        </div>
      </div>

      <div className="pd-titlerow">
        <div>
          <h1>{p.title}</h1>
          <p>{p.repoUrl ? p.repoUrl.replace('https://', '') : 'Private client repository'}</p>
        </div>
        <div className="pd-cats">
          <span className="pd-cat on">{BUCKET_LABELS[p.bucket]}</span>
          {p.featured && <span className="pd-cat">Featured</span>}
        </div>
      </div>

      <dl className="pd-panel">
        <div><dt>Brief</dt><dd>{p.blurb}</dd></div>
        {p.liveNote && <div><dt>Status</dt><dd>{p.liveNote}</dd></div>}
        {p.metrics && (
          <div>
            <dt>Numbers</dt>
            <dd className="pd-figures">{p.metrics.map((m) => <span key={m.label}><b>{m.value}</b> {m.label}</span>)}</dd>
          </div>
        )}
        <div><dt>Stack</dt><dd className="chips">{p.tech.map((t) => <TechChip key={t} name={t} />)}</dd></div>
        <div><dt>Detail</dt><dd>{p.detail}</dd></div>
      </dl>

      {p.writeup && (
        <section className="pd-writeup">
          <h2>How it works</h2>
          <ol className="pipeline">
            {p.writeup.pipeline.map((s, i) => (
              <li key={i}>
                <span className="pl-step">{s.step}</span>
                <span className="pl-detail">{s.detail}</span>
              </li>
            ))}
          </ol>
          <h2>Engineering notes</h2>
          <dl className="pd-panel">
            {p.writeup.notes.map((n) => (
              <div key={n.title}><dt>{n.title}</dt><dd>{n.body}</dd></div>
            ))}
          </dl>
          {p.writeup.limits && (
            <>
              <h2>Known limits</h2>
              <ul className="limits">{p.writeup.limits.map((l) => <li key={l}>{l}</li>)}</ul>
            </>
          )}
        </section>
      )}
      <nav className="pd-nav">
        <button className="pd-nav-btn" onClick={() => onNav(prev.slug)}><Sym name="back" /><span><small>Previous</small>{prev.title}</span></button>
        <button className="pd-nav-btn right" onClick={() => onNav(next.slug)}><span><small>Next</small>{next.title}</span><Sym name="forward" /></button>
      </nav>
    </article>
  );
}

/** Nautilus-style browser: places sidebar, path bar, grid/list views, in-window history. */
export function Projects({ payload }: { payload: string | null }) {
  const { winId } = useWin();
  const setPayload = useOS((s) => s.setPayload);
  const [place, setPlace] = useState<Place>('all');
  const [q, setQ] = useState('');
  const [searching, setSearching] = useState(false);
  const [list, setList] = useState(false);
  const [hist, setHist] = useState<{ back: (string | null)[]; fwd: (string | null)[] }>({ back: [], fwd: [] });
  const scroller = useRef<HTMLDivElement>(null);
  const project = payload ? getProject(payload) : undefined;
  const items = useMemo(() => filterBy(place, q), [place, q]);

  const nav = (slug: string | null) => {
    setPayload(winId, slug);
    scroller.current?.scrollTo({ top: 0 });
  };
  const go = (slug: string | null) => {
    setHist((h) => ({ back: [...h.back, payload], fwd: [] }));
    nav(slug);
  };
  const goBack = () => {
    if (!hist.back.length) return nav(null);
    setHist((h) => ({ back: h.back.slice(0, -1), fwd: [...h.fwd, payload] }));
    nav(hist.back[hist.back.length - 1]);
  };
  const goFwd = () => {
    if (!hist.fwd.length) return;
    setHist((h) => ({ back: [...h.back, payload], fwd: h.fwd.slice(0, -1) }));
    nav(hist.fwd[hist.fwd.length - 1]);
  };
  const pickPlace = (p: Place) => {
    setPlace(p);
    if (project) go(null);
  };

  const places: Place[] = ['all', 'featured', 'live', ...buckets];
  const count = (p: Place) => filterBy(p, '').length;

  return (
    <div className="files">
      <HeaderBar
        start={
          <>
            <button className="hb-icon" aria-label="Back" disabled={!project && !hist.back.length} onClick={goBack}><Sym name="back" /></button>
            <button className="hb-icon" aria-label="Forward" disabled={!hist.fwd.length} onClick={goFwd}><Sym name="forward" /></button>
          </>
        }
        title={
          searching && !project ? (
            <label className="hb-search" data-no-drag>
              <Sym name="search" />
              <input autoFocus value={q} placeholder={`Search ${PLACE_LABEL(place)}`} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && (setQ(''), setSearching(false))} />
            </label>
          ) : (
            <div className="pathbar" data-no-drag>
              <button onClick={() => { setPlace('all'); if (project) go(null); }}><Sym name="folder" size={14} /> Projects</button>
              {!project && place !== 'all' && <><span className="sep">/</span><button className="cur">{PLACE_LABEL(place)}</button></>}
              {project && <><span className="sep">/</span><button className="cur">{project.title}</button></>}
            </div>
          )
        }
        end={
          !project && (
            <>
              <button className={`hb-icon ${searching ? 'on' : ''}`} aria-label="Search" aria-pressed={searching} onClick={() => { setSearching(!searching); setQ(''); }}><Sym name="search" /></button>
              <button className="hb-icon" aria-label={list ? 'Grid view' : 'List view'} onClick={() => setList(!list)}><Sym name={list ? 'grid' : 'list'} /></button>
            </>
          )
        }
      />
      <aside className="sidebar" aria-label="Places">
        {places.map((p, i) => (
          <div key={p}>
            {i === 3 && <><div className="sb-sep">Categories</div><div className="sb-sep-line" /></>}
            <button className={`sb-item ${place === p && !project ? 'on' : ''}`} onClick={() => pickPlace(p)} title={PLACE_LABEL(p)} aria-label={`${PLACE_LABEL(p)}, ${count(p)} projects`}>
              <Sym name={PLACE_ICON[p]} />
              <span>{PLACE_LABEL(p)}</span>
              <span className="sb-count">{count(p)}</span>
            </button>
          </div>
        ))}
      </aside>
      <div className="files-main scroll" ref={scroller}>
        {project ? (
          <Detail p={project} onNav={(s) => go(s)} />
        ) : (
          <>
            <div className="chips-scroller" role="tablist" aria-label="Categories">
              {places.map((p) => (
                <button key={p} role="tab" aria-selected={place === p} className={`chip-btn ${place === p ? 'on' : ''}`} onClick={() => pickPlace(p)}>{PLACE_LABEL(p)}</button>
              ))}
            </div>
            {items.length === 0 ? (
              <div className="empty"><Sym name="search" size={48} /><p>No projects match “{q}”</p></div>
            ) : (
              <div className={list ? 'p-list' : 'p-grid'}>
                {items.map((p) => <Card key={p.slug} p={p} list={list} onOpen={() => go(p.slug)} />)}
              </div>
            )}
          </>
        )}
      </div>
      <div className="statusbar">{project ? `${project.tech.length} technologies` : `${items.length} item${items.length === 1 ? '' : 's'}`}</div>
    </div>
  );
}
