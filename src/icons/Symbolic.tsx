/**
 * Real GNOME / Yaru symbolic icons (public/ubuntu/symbolic), drawn in
 * currentColor through a CSS mask exactly as GNOME Shell recolours them.
 */
export function Symbolic({ name, size = 16, className = '', label }: { name: string; size?: number; className?: string; label?: string }) {
  const url = `url(/ubuntu/symbolic/${name}.svg)`;
  return (
    <span
      className={`symbolic ${className}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ width: size, height: size, WebkitMaskImage: url, maskImage: url }}
    />
  );
}
