import { useEffect, useRef, useState } from 'react';
import { useOS, ACCENTS, type Accent } from '../os/store';
import { APPS, isAppId } from '../os/apps';
import { allProjects, getProject, BUCKET_LABELS } from '../lib/projects';
import { profile, education, stack, socials } from '../data/profile';
import { experience } from '../data/experience';
import { contributions } from '../data/contributions';
import { HeaderBar } from '../shell/HeaderBar';
import { useWin } from '../shell/winContext';

type Line = { kind: 'in' | 'out' | 'err' | 'html'; text: string; cwd?: string };

/** A tiny read-only filesystem generated from the portfolio data. */
type Node = { type: 'dir'; children: Record<string, Node> } | { type: 'file'; content: () => string; open?: [string, string | null] };
const file = (content: () => string, open?: [string, string | null]): Node => ({ type: 'file', content, open });

const FS: { type: 'dir'; children: Record<string, Node> } = {
  type: 'dir',
  children: {
    'about.txt': file(() => `${profile.name} (${profile.fullName})\n${profile.tagline}\n${profile.location}\n\n${education.degree}\n${education.school}, ${education.period}, CGPA ${education.cgpa}`, ['about', null]),
    'experience.md': file(() => experience.map((x) => `# ${x.role}\n${x.company} · ${x.period}\n\n${x.bullets.map((b) => `- ${b}`).join('\n')}`).join('\n\n')),
    'stack.txt': file(() => stack.map((g) => `${g.label.padEnd(14)} ${g.items.join(', ')}`).join('\n')),
    'contact.txt': file(() => [`email      ${profile.email}`, ...socials.map((s) => `${s.label.padEnd(10)} ${s.href}`)].join('\n'), ['contact', null]),
    'resume.pdf': file(() => 'resume.pdf is a binary file. Try: open resume', ['resume', null]),
    projects: {
      type: 'dir',
      children: Object.fromEntries(
        allProjects.map((p) => [
          `${p.slug}.md`,
          file(() => `# ${p.title}\n[${BUCKET_LABELS[p.bucket]}]\n\n${p.blurb}\n\nstack: ${p.tech.join(', ')}${p.liveUrl ? `\nlive:  ${p.liveUrl}` : ''}${p.repoUrl ? `\nrepo:  ${p.repoUrl}` : ''}`, ['projects', p.slug]),
        ]),
      ),
    },
    'open-source': {
      type: 'dir',
      children: Object.fromEntries(contributions.map((c) => [`focuser-pr-${c.pullRequestNumber}.md`, file(() => `# ${c.title} (${c.project} #${c.pullRequestNumber})\nmerged ${c.mergedLabel}\n\n${c.summary}\n\n${c.pullRequestUrl}`, ['opensource', null])])),
    },
  },
};

function resolve(cwd: string[], path: string): { node: Node | null; parts: string[] } {
  const parts = path.startsWith('/') || path.startsWith('~') ? [] : [...cwd];
  for (const seg of path.replace(/^~\/?/, '').split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  let node: Node | null = FS;
  for (const seg of parts) node = node?.type === 'dir' ? node.children[seg] ?? null : null;
  return { node, parts };
}

// neofetch's own "ubuntu_small" logo (MIT licensed).
const NEOFETCH_ART = [
  '         _',
  '     ---(_)',
  ' _/  ---  \\',
  '(_) |   |',
  '  \\  --- _/',
  '     ---(_)',
];

const HELP = `Available commands:
  help                 show this help
  whoami               who is this person
  neofetch             system info, the proper way
  ls [dir]             list files          cd <dir>    change directory
  cat <file>           print a file        pwd         print working directory
  open <app|project>   open an app or a project window (try: open mediquery)
  projects             list all projects   skills      list the stack
  experience           work history        contact     ways to reach me
  resume               open the resume     github      open GitHub profile
  theme <dark|light>   switch style        accent <colour>
  history  clear  date  echo  uname  exit
Tip: Tab completes, Up/Down walks history, Ctrl+L clears.`;

export function Terminal() {
  const { winId, focused } = useWin();
  const [lines, setLines] = useState<Line[]>(() => [

  ]);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState<string[]>([]);
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const n = Number(winId.split('-')[1] ?? 1);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lines]);
  useEffect(() => {
    if (focused) inputRef.current?.focus({ preventScroll: true });
  }, [focused]);

  const cwdStr = `~${cwd.length ? `/${cwd.join('/')}` : ''}`;
  const os = useOS.getState();

  const run = (raw: string): Line[] | 'clear' => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');
    const out = (text: string): Line[] => [{ kind: 'out', text }];
    const err = (text: string): Line[] => [{ kind: 'err', text }];
    switch (cmd) {
      case undefined:
      case '':
        return [];
      case 'help':
      case '?':
        return out(HELP);
      case 'whoami':
        return out(`${profile.name}\n${profile.bio}`);
      case 'neofetch':
      case 'fastfetch': {
        const st = os.settings;
        const theme = `Yaru${st.accent === 'orange' ? '' : `-${st.accent === 'prussian' ? 'prussiangreen' : st.accent}`}${st.theme === 'dark' ? '-dark' : ''}`;
        const info = [
          `kbs@ubuntu`,
          `----------`,
          `OS: Ubuntu 24.04 LTS x86_64`,
          `Kernel: 6.8.0-48-generic`,
          `Shell: bash 5.2.21`,
          `DE: GNOME 46.0`,
          `WM: Mutter`,
          `Theme: ${theme} [GTK2/3]`,
          `Icons: Yaru [GTK2/3]`,
          `Terminal: gnome-terminal`,
          ``,
          `__PALETTE__`,
        ];
        const rows = Math.max(NEOFETCH_ART.length, info.length);
        const text = Array.from({ length: rows }, (_, i) => `${(NEOFETCH_ART[i] ?? '').padEnd(21)}${info[i] ?? ''}`).join('\n');
        return [{ kind: 'html', text }];
      }
      case 'pwd':
        return out(`/home/kbs${cwd.length ? `/${cwd.join('/')}` : ''}`);
      case 'ls':
      case 'll':
      case 'dir': {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const target = args.filter((a) => !a.startsWith('-'))[0] ?? '.';
        const { node } = resolve(cwd, target);
        if (!node) return err(`ls: cannot access '${target}': No such file or directory`);
        if (node.type === 'file') return out(target);
        const names = Object.keys(node.children).filter((k) => showAll || !k.startsWith('.'));
        return [{ kind: 'html', text: `__LS__${names.map((k) => (node.children[k].type === 'dir' ? `${k}/` : k)).join('\n')}` }];
      }
      case 'cd': {
        if (!arg || arg === '~') { setCwd([]); return []; }
        const { node, parts } = resolve(cwd, arg);
        if (!node) return err(`cd: ${arg}: No such file or directory`);
        if (node.type !== 'dir') return err(`cd: ${arg}: Not a directory`);
        setCwd(parts);
        return [];
      }
      case 'cat':
      case 'less':
      case 'more': {
        if (!arg) return err(`${cmd}: missing file operand`);
        const { node } = resolve(cwd, arg);
        if (!node) return err(`${cmd}: ${arg}: No such file or directory`);
        if (node.type === 'dir') return err(`${cmd}: ${arg}: Is a directory`);
        return out(node.content());
      }
      case 'open':
      case 'xdg-open': {
        if (!arg) return err('usage: open <app|project|file>');
        const key = arg.toLowerCase().replace(/\.(md|txt|pdf)$/, '');
        if (isAppId(key)) { os.openApp(key); return out(`Opening ${key}...`); }
        const app = APPS.find((a) => a.name.toLowerCase() === key || a.keywords.includes(key));
        if (app) { os.openApp(app.id); return out(`Opening ${app.name}...`); }
        const { node } = resolve(cwd, arg);
        if (node?.type === 'file' && node.open) { os.openApp(node.open[0] as never, node.open[1]); return out(`Opening ${arg}...`); }
        const p = getProject(arg) ?? allProjects.find((x) => x.title.toLowerCase().includes(key) || x.slug.toLowerCase().includes(key));
        if (p) { os.openApp('projects', p.slug); return out(`Opening project ${p.title}...`); }
        return err(`open: '${arg}' not found. Try 'projects' or 'ls'.`);
      }
      case 'projects':
        return out(allProjects.map((p) => `${(p.featured ? '* ' : '  ') + p.slug.padEnd(42)} ${BUCKET_LABELS[p.bucket]}`).join('\n') + '\n\n* featured. open <name> to view one.');
      case 'skills':
      case 'stack':
        return out((FS.children['stack.txt'] as { content: () => string }).content());
      case 'experience':
        return out((FS.children['experience.md'] as { content: () => string }).content());
      case 'contact':
        os.openApp('contact');
        return out((FS.children['contact.txt'] as { content: () => string }).content());
      case 'resume':
        os.openApp('resume');
        return out('Opening resume...');
      case 'github':
      case 'linkedin': {
        const url = cmd === 'github' ? profile.github : profile.linkedin;
        window.open(url, '_blank', 'noopener');
        return out(`Opening ${url}`);
      }
      case 'email':
      case 'mail':
        return out(profile.email);
      case 'theme':
        if (arg !== 'dark' && arg !== 'light') return err('usage: theme <dark|light>');
        os.updateSettings({ theme: arg });
        return out(`Style set to ${arg}.`);
      case 'accent': {
        if (!(arg in ACCENTS)) return err(`usage: accent <${Object.keys(ACCENTS).join('|')}>`);
        os.updateSettings({ accent: arg as Accent });
        return out(`Accent set to ${arg}.`);
      }
      case 'history':
        return out(hist.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n'));
      case 'date':
        return out(new Date().toString());
      case 'echo':
        return out(arg);
      case 'uname':
        return out(args.includes('-a') ? 'Linux ubuntu 6.8.0-48-generic #48-Ubuntu SMP PREEMPT_DYNAMIC x86_64 x86_64 x86_64 GNU/Linux' : 'Linux');
      case 'hostname':
        return out('ubuntu');
      case 'clear':
        return 'clear';
      case 'exit':
      case 'logout':
        os.closeWin(winId);
        return [];
      default:
        return err(`${cmd}: command not found. Type 'help' for a list.`);
    }
  };

  const submit = () => {
    const raw = input;
    setInput('');
    setHi(-1);
    if (raw.trim()) setHist((h) => [...h, raw]);
    const res = run(raw);
    if (res === 'clear') { setLines([]); return; }
    setLines((l) => [...l, { kind: 'in', text: raw, cwd: cwdStr }, ...res]);
  };

  const complete = () => {
    const parts = input.split(/\s+/);
    const last = parts.at(-1) ?? '';
    if (parts.length === 1) {
      const cmds = ['help', 'whoami', 'neofetch', 'ls', 'cd', 'cat', 'pwd', 'open', 'projects', 'skills', 'experience', 'contact', 'resume', 'github', 'linkedin', 'theme', 'accent', 'history', 'clear', 'date', 'echo', 'uname', 'exit'];
      const m = cmds.filter((c) => c.startsWith(last));
      if (m.length === 1) setInput(`${m[0]} `);
      else if (m.length > 1) setLines((l) => [...l, { kind: 'in', text: input, cwd: cwdStr }, { kind: 'out', text: m.join('  ') }]);
      return;
    }
    let pool: string[];
    if (parts[0] === 'open') pool = [...APPS.map((a) => a.id), ...allProjects.map((p) => p.slug)];
    else if (parts[0] === 'accent') pool = Object.keys(ACCENTS);
    else {
      const dirPart = last.includes('/') ? last.slice(0, last.lastIndexOf('/') + 1) : '';
      const { node } = resolve(cwd, dirPart || '.');
      pool = node?.type === 'dir' ? Object.keys(node.children).map((k) => dirPart + k + (node.children[k].type === 'dir' ? '/' : '')) : [];
    }
    const m = pool.filter((c) => c.startsWith(last));
    if (m.length === 1) setInput([...parts.slice(0, -1), m[0]].join(' ') + (m[0].endsWith('/') ? '' : ' '));
    else if (m.length > 1) {
      let prefix = m[0];
      for (const s of m) while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
      if (prefix.length > last.length) setInput([...parts.slice(0, -1), prefix].join(' '));
      else setLines((l) => [...l, { kind: 'in', text: input, cwd: cwdStr }, { kind: 'out', text: m.join('  ') }]);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit();
    else if (e.key === 'Tab') { e.preventDefault(); complete(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!hist.length) return;
      const i = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1);
      setHi(i);
      setInput(hist[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hi < 0) return;
      const i = hi + 1;
      if (i >= hist.length) { setHi(-1); setInput(''); } else { setHi(i); setInput(hist[i]); }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') { e.preventDefault(); setLines([]); }
    else if (e.ctrlKey && e.key.toLowerCase() === 'c') { e.preventDefault(); setLines((l) => [...l, { kind: 'in', text: `${input}^C`, cwd: cwdStr }]); setInput(''); }
  };

  const prompt = (dir: string) => (
    <span className="t-prompt"><span className="t-user">kbs@ubuntu</span>:<span className="t-dir">{dir}</span>$ </span>
  );

  return (
    <div className="term" onMouseUp={() => { if (!window.getSelection()?.toString()) inputRef.current?.focus({ preventScroll: true }); }}>
      <HeaderBar title={<span className="hb-title-text">kbs@ubuntu: {cwdStr}{n > 1 ? ` (${n})` : ''}</span>} />
      <div className="term-scroll scroll">
        {lines.map((l, i) => {
          if (l.kind === 'in') return <div key={i} className="t-line">{prompt(l.cwd ?? '~')}{l.text}</div>;
          if (l.kind === 'html' && l.text.startsWith('__LS__')) {
            return <div key={i} className="t-ls">{l.text.slice(6).split('\n').map((name) => <span key={name} className={name.endsWith('/') ? 't-dir' : name.endsWith('.pdf') ? 't-bin' : ''}>{name}</span>)}</div>;
          }
          if (l.kind === 'html') {
            return (
              <pre key={i} className="t-out t-neo">
                {l.text.split('\n').map((row, j) =>
                  row.includes('__PALETTE__') ? (
                    <div key={j}>{row.replace('__PALETTE__', '')}{['#2e3436', '#cc0000', '#4e9a06', '#c4a000', '#3465a4', '#75507b', '#06989a', '#d3d7cf'].map((c) => <span key={c} className="t-swatch" style={{ background: c }} />)}</div>
                  ) : (
                    <div key={j}><span className="t-art">{row.slice(0, 21)}</span><span className={j === 0 ? 't-user' : ''}>{row.slice(21).split(': ').map((part, k, arr) => k === 0 && arr.length > 1 ? <span key={k} className="t-key">{part}: </span> : <span key={k}>{part}</span>)}</span></div>
                  ),
                )}
              </pre>
            );
          }
          return <pre key={i} className={`t-out ${l.kind === 'err' ? 't-err' : ''}`}>{l.text}</pre>;
        })}
        <div className="t-line t-live">
          {prompt(cwdStr)}
          <input
            ref={inputRef}
            className="t-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label="Terminal input"
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
