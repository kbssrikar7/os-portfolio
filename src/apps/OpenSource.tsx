import { contributions } from '../data/contributions';
import github from '../data/github.json';
import { profile } from '../data/profile';
import { HeaderBar } from '../shell/HeaderBar';
import { Sym } from '../icons/Sym';
import { ExtLink, TechChip } from './ui';

function YearHeat() {
  const { levels, counts, start, total } = github.contributions;
  const startDate = new Date(start);
  const pad = startDate.getDay(); // weeks start Sunday, like GitHub
  const cells = [...Array(pad).fill(-1), ...levels];
  const weeks = Math.ceil(cells.length / 7);
  const months: { label: string; col: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + w * 7 - pad);
    if (d.getDate() <= 7) months.push({ label: d.toLocaleDateString([], { month: 'short' }), col: w });
  }
  const best = Math.max(...counts);
  return (
    <div className="boxed yheat">
      <div className="yheat-head">
        <strong>{total} contributions</strong> in the last year
        <span className="dim">Busiest day: {best} contributions</span>
      </div>
      <div className="yheat-scroll">
        <div className="yheat-months" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
          {months.map((m) => <span key={m.col} style={{ gridColumn: m.col + 1 }}>{m.label}</span>)}
        </div>
        <div className="heat big" style={{ gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))` }}>
          {Array.from({ length: weeks }, (_, w) => (
            <div key={w} className="heat-col">
              {cells.slice(w * 7, w * 7 + 7).map((l, d) => <i key={d} className={l < 0 ? 'pad' : `l${l}`} title={l < 0 ? undefined : `${counts[w * 7 + d - pad]} contributions`} />)}
            </div>
          ))}
        </div>
      </div>
      <div className="heat-legend">Less {[0, 1, 2, 3, 4].map((l) => <i key={l} className={`l${l}`} />)} More</div>
    </div>
  );
}

export function OpenSource() {
  const stars = Object.entries(github.stars).sort((a, b) => b[1] - a[1]);
  return (
    <>
      <HeaderBar end={<ExtLink href={profile.github} className="hb-btn" icon="github">GitHub</ExtLink>} />
      <div className="scroll oss">
        <h1 className="oss-title">Open Source</h1>
        <p className="dim oss-sub">Merged upstream work and a year of public activity on <a href={profile.github} target="_blank" rel="noreferrer">@kbssrikar7</a>.</p>
        <YearHeat />
        <h2 className="sec-title"><Sym name="pr" /> Merged pull requests</h2>
        {contributions.map((c) => (
          <article key={c.pullRequestNumber} className="boxed pr">
            <header className="pr-head">
              <span className="pr-badge"><Sym name="pr" size={14} /> Merged</span>
              <span className="dim">{c.mergedLabel}</span>
            </header>
            <h3><a href={c.pullRequestUrl} target="_blank" rel="noreferrer">{c.title}</a> <span className="dim">#{c.pullRequestNumber}</span></h3>
            <p className="pr-repo"><a href={c.repositoryUrl} target="_blank" rel="noreferrer">{c.project}</a> · {c.description}</p>
            <p>{c.summary}</p>
            <ul className="pr-details">{c.details.map((d) => <li key={d}>{d}</li>)}</ul>
            <div className="chips">{c.stack.map((s) => <TechChip key={s} name={s} />)}</div>
          </article>
        ))}
        <h2 className="sec-title"><Sym name="star" /> Starred repositories</h2>
        <div className="boxed rows">
          {stars.map(([name, n]) => (
            <a key={name} className="row link-row" href={`${profile.github}/${name}`} target="_blank" rel="noreferrer">
              <Sym name="github" />
              <span className="lr-label">{name}</span>
              <span className="lr-handle"><Sym name="star" size={13} /> {n}</span>
              <Sym name="external" size={14} />
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
