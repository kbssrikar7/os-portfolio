import { useState } from 'react';
import { profile, education } from '../data/profile';
import { experience } from '../data/experience';
import { getProject } from '../lib/projects';
import { useOS } from '../os/store';
import { HeaderBar } from '../shell/HeaderBar';
import { Sym } from '../icons/Sym';
import { useDragUI } from '../shell/dragUI';

const RESUME_PROJECTS = ['healthcare-qa-chatbot', 'studyFlow--AI_Powered_Productivity_Suite', 'handwritten-equation-solver', 'headphonesafety'];
const SKILLS: [string, string][] = [
  ['Languages', 'Python, Java, SQL, Bash, Swift'],
  ['Frameworks & Libraries', 'FastAPI, React, Next.js, TensorFlow, OpenCV, LangChain'],
  ['AI & LLM', 'RAG, ChromaDB, Hugging Face Transformers, Groq, MCP'],
  ['Developer Tools', 'Linux, Git, Docker, GitHub Actions, Jenkins, Vim, VS Code'],
  ['Databases', 'PostgreSQL, MySQL, Microsoft SQL Server'],
  ['Cloud & Platforms', 'AWS, GCP, Vercel, Hugging Face Spaces, Qdrant Cloud, Neon'],
];

/** Accessible text version of the PDF, mirroring its sections. Phone number stays in the PDF only. */
function TextResume() {
  const { openApp } = useOS.getState();
  return (
    <div className="paper">
      <h1>{profile.fullName}</h1>
      <p className="paper-contact">
        <a href={`mailto:${profile.email}`}>{profile.email}</a> · <a href={profile.linkedin} target="_blank" rel="noreferrer">linkedin.com/in/kbss0000</a> · <a href={profile.github} target="_blank" rel="noreferrer">github.com/kbssrikar7</a>
      </p>
      <h2>Education</h2>
      <div className="paper-item">
        <div className="paper-line"><strong>{education.school}, {education.campus}</strong><span>{education.period}</span></div>
        <div className="paper-line"><em>Bachelor of Technology in Computer Science and Engineering</em><span>CGPA: {education.cgpa}</span></div>
      </div>
      <h2>Work Experience</h2>
      {experience.map((x) => (
        <div key={x.company} className="paper-item">
          <div className="paper-line"><strong>{x.role}</strong><span>{x.period}</span></div>
          <div className="paper-line"><em>{x.company} India Pvt. Ltd.</em><span>{x.location}</span></div>
          <ul>{x.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      ))}
      <h2>Projects</h2>
      {RESUME_PROJECTS.map((slug) => {
        const p = getProject(slug);
        if (!p) return null;
        return (
          <div key={slug} className="paper-item">
            <div className="paper-line">
              <span><button className="link-btn" onClick={() => openApp('projects', slug)}><strong>{p.title}</strong></button> | <em>{p.tech.slice(0, 4).join(', ')}</em></span>
              {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">Live Site</a>}
            </div>
            <p>{p.blurb}</p>
          </div>
        );
      })}
      <h2>Technical Skills</h2>
      <dl className="paper-skills">{SKILLS.map(([k, v]) => <div key={k}><dt>{k}:</dt> <dd>{v}</dd></div>)}</dl>
    </div>
  );
}

/** Document Viewer: the real PDF, plus a text view that also works where PDFs cannot be embedded (phones). */
export function Resume() {
  const mobile = useOS((s) => s.mobile);
  const dragging = useDragUI((s) => s.active);
  const [view, setView] = useState<'pdf' | 'text'>(mobile ? 'text' : 'pdf');
  return (
    <div className="viewer">
      <HeaderBar
        title={
          <div className="seg" role="tablist" data-no-drag>
            <button role="tab" aria-selected={view === 'pdf'} className={view === 'pdf' ? 'on' : ''} onClick={() => setView('pdf')}>Document</button>
            <button role="tab" aria-selected={view === 'text'} className={view === 'text' ? 'on' : ''} onClick={() => setView('text')}>Text</button>
          </div>
        }
        start={<span className="hb-file">kbs-srikar-resume.pdf</span>}
        end={
          <>
            <a className="hb-icon" href={profile.resume} target="_blank" rel="noreferrer" aria-label="Open in new tab" title="Open in new tab"><Sym name="external" /></a>
            <a className="hb-btn suggested" href={profile.resume} download><Sym name="download" size={14} /> Download</a>
          </>
        }
      />
      {view === 'pdf' ? (
        <iframe className="pdf-frame" src={`${profile.resume}#view=FitH&toolbar=1`} title="Resume PDF" style={{ pointerEvents: dragging ? 'none' : undefined }} />
      ) : (
        <div className="scroll paper-scroll"><TextResume /></div>
      )}
    </div>
  );
}
