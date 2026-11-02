import { create } from 'zustand';
import type { Rect } from '../os/wm';

/** Shared drag state: the snap preview and the iframe pointer guard both read it. */
export const useDragUI = create<{ snap: Rect | null; active: boolean; set: (p: Partial<{ snap: Rect | null; active: boolean }>) => void }>((set) => ({
  snap: null,
  active: false,
  set: (p) => set(p),
}));
