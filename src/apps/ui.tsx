import { techIcon } from '../lib/tech-icons';
import { Sym } from '../icons/Sym';

export function TechChip({ name }: { name: string }) {
  const icon = techIcon(name);
  return (
    <span className="chip">
      {icon && <img src={icon} alt="" width={14} height={14} loading="lazy" />}
      {name}
    </span>
  );
}

export function ExtLink({ href, children, className = 'pill-btn', icon = 'external' }: { href: string; children: React.ReactNode; className?: string; icon?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {children}
      <Sym name={icon} size={14} />
    </a>
  );
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <span className="metric-v">{value}</span>
      <span className="metric-l">{label}</span>
    </div>
  );
}

/** Ensure an app's own scroll area resets when its route changes. */
export function Scroll({ children, className = '', resetKey }: { children: React.ReactNode; className?: string; resetKey?: string | null }) {
  return (
    <div className={`scroll ${className}`} key={resetKey ?? undefined}>
      {children}
    </div>
  );
}
