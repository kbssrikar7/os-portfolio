import { createContext, useContext } from 'react';

export type WinCtx = { winId: string; slot: HTMLElement | null; focused: boolean; title: string };
export const WinContext = createContext<WinCtx>({ winId: '', slot: null, focused: false, title: '' });

export function useWin() {
  return useContext(WinContext);
}
