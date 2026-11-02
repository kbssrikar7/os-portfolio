/** Browser storage can throw (private mode, blocked site data). Never let that break the shell. */
export function readJSON<T>(store: 'local' | 'session', key: string, fallback: T): T {
  try {
    const s = store === 'local' ? window.localStorage : window.sessionStorage;
    const raw = s.getItem(key);
    return raw ? { ...fallback, ...(JSON.parse(raw) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(store: 'local' | 'session', key: string, value: unknown): void {
  try {
    const s = store === 'local' ? window.localStorage : window.sessionStorage;
    s.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: settings simply do not persist */
  }
}
