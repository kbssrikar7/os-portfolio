import { useState } from 'react';
import { profile, socials } from '../data/profile';
import { HeaderBar } from '../shell/HeaderBar';
import { Sym } from '../icons/Sym';
import { Avatar } from '../shell/Login';

const SOCIAL_ICON: Record<string, string> = { github: 'github', linkedin: 'linkedin', x: 'x', huggingface: 'hf', monkeytype: 'keyboard' };

/**
 * Mail-style composer. It does not pretend to send: "Send" hands the draft to
 * the visitor's own mail client through a mailto: link, and says so.
 */
export function Contact() {
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'opened' | 'copied'>('idle');

  const send = () => {
    const text = name ? `${body}\n\n- ${name}` : body;
    const url = `mailto:${profile.email}?subject=${encodeURIComponent(subject || 'Hello from your portfolio')}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
    setStatus('opened');
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setStatus('copied');
    } catch {
      setStatus('idle');
    }
  };

  return (
    <div className="mail">
      <HeaderBar
        start={<button className="hb-btn" onClick={() => { setName(''); setSubject(''); setBody(''); setStatus('idle'); }} disabled={!name && !subject && !body}>Discard</button>}
        title={<span className="hb-title-text">New Message</span>}
        end={<button className="hb-btn suggested" disabled={!body.trim()} onClick={send}><Sym name="send" size={14} /> Send</button>}
      />
      <div className="mail-body scroll">
        <form className="mail-form" onSubmit={(e) => { e.preventDefault(); if (body.trim()) send(); }}>
          <div className="mail-field">
            <span>To</span>
            <span className="to-chip"><Avatar size={24} />{profile.name} &lt;{profile.email}&gt;</span>
            <button type="button" className="flat-btn" onClick={copy} title="Copy address" aria-label="Copy email address"><Sym name={status === 'copied' ? 'check' : 'copy'} /></button>
          </div>
          <label className="mail-field"><span>From</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" /></label>
          <label className="mail-field"><span>Subject</span><input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Let's work together" /></label>
          <textarea className="mail-text" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your message..." aria-label="Message" />
          <p className={`mail-status ${status}`} role="status">
            {status === 'opened' && <>Your email app should open with this draft. Nothing happened? Write to <a href={`mailto:${profile.email}`}>{profile.email}</a>.</>}
            {status === 'copied' && <>Copied {profile.email} to the clipboard.</>}
            {status === 'idle' && <>Send opens your own email app with the draft filled in. Nothing is sent from this page.</>}
          </p>
        </form>
        <aside className="mail-side">
          <h3>Elsewhere</h3>
          <ul className="boxed rows">
            {socials.map((s) => (
              <li key={s.key}>
                <a className="row link-row" href={s.href} target="_blank" rel="noreferrer">
                  <Sym name={SOCIAL_ICON[s.key]} />
                  <span className="lr-label">{s.label}</span>
                  <span className="lr-handle">@{s.handle}</span>
                  <Sym name="external" size={14} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mail-loc"><Sym name="location" size={14} /> Based in {profile.location}.</p>
        </aside>
      </div>
    </div>
  );
}
