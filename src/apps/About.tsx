import { profile, education, stack, socials } from '../data/profile';
import { experience } from '../data/experience';
import { allProjects } from '../lib/projects';
import { useOS } from '../os/store';
import { HeaderBar } from '../shell/HeaderBar';
import { Avatar } from '../shell/Login';
import { Sym } from '../icons/Sym';

const stackLabel = (l: string) =>
  l.replace(/\b(ml|ai)\b/g, (m) => m.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase()).replace(/\+ (\w)/, (_m, c: string) => `+ ${c.toUpperCase()}`);

const SOCIAL_ICON: Record<string, string> = { github: 'github', linkedin: 'linkedin', x: 'x', huggingface: 'hf', monkeytype: 'keyboard' };

/**
 * Settings-style split view: secondary facts in the sidebar, an editorial
 * reading column in the main pane. Every sentence here is taken from the
 * owner's own data files; nothing is invented.
 */
export function About() {
  const { openApp } = useOS.getState();
  const featured = allProjects.filter((p) => p.featured);
  return (
    <div className="about-app">
      <HeaderBar
        end={
          <>
            <button className="hb-btn" onClick={() => openApp('projects')}><Sym name="folder" size={14} /> Projects</button>
            <button className="hb-btn" onClick={() => openApp('resume')}><Sym name="download" size={14} /> Resume</button>
          </>
        }
      />
      <aside className="sidebar about-side" aria-label="Profile details">
        <section>
          <h2 className="sb-head">Links</h2>
          {socials.map((s) => (
            <a key={s.key} className="sb-item" href={s.href} target="_blank" rel="noreferrer">
              <Sym name={SOCIAL_ICON[s.key]} />
              <span>{s.label}</span>
              <Sym name="external" size={12} />
            </a>
          ))}
          <a className="sb-item" href={`mailto:${profile.email}`}>
            <Sym name="mail" />
            <span>email</span>
          </a>
        </section>
        <section>
          <h2 className="sb-head">Stack</h2>
          <dl className="sb-stack">
            {stack.map((g) => (
              <div key={g.label}>
                <dt>{stackLabel(g.label)}</dt>
                <dd>{g.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      </aside>

      <article className="about-main scroll">
        <header className="about-head">
          <Avatar size={72} />
          <div>
            <h1>{profile.name}</h1>
            <p>{profile.tagline}</p>
          </div>
        </header>

        <div className="about-sec">
          <h2>Focus</h2>
          <div>
            <p>{profile.bio}</p>
            <p className="about-facts">
              <span><Sym name="location" size={14} /> {profile.location}</span>
              <span><Sym name="school" size={14} /> {education.school}, {education.period.split(' - ')[1]}</span>
            </p>
          </div>
        </div>

        {experience.map((x) => (
          <div key={x.company} className="about-sec">
            <h2>Experience</h2>
            <div>
              <h3>{x.role}</h3>
              <p className="about-meta">
                {x.companyUrl ? <a href={x.companyUrl} target="_blank" rel="noreferrer">{x.company}</a> : x.company} · {x.period} · {x.location}
              </p>
              <p>{x.summary}</p>
              <ul className="about-list">{x.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <dl className="about-figures">
                {x.metrics.map((m) => (
                  <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>
                ))}
              </dl>
            </div>
          </div>
        ))}

        <div className="about-sec">
          <h2>Education</h2>
          <div>
            <h3>{education.degree}</h3>
            <p className="about-meta">{education.school}, {education.campus} · {education.period} · CGPA {education.cgpa}</p>
          </div>
        </div>

        <div className="about-sec">
          <h2>Selected work</h2>
          <ul className="about-work">
            {featured.map((p) => (
              <li key={p.slug}>
                <button className="link-btn" onClick={() => openApp('projects', p.slug)}>{p.title}</button>
                <span>{p.blurb}</span>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </div>
  );
}
