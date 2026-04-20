import { createContext, useContext } from 'react';
import type { GlobeEngine } from './GlobeEngine';

export const EngineContext = createContext<GlobeEngine | null>(null);

export function useEngine(): GlobeEngine {
  const engine = useContext(EngineContext);
  if (!engine) {
    throw new Error('useEngine must be used inside <EngineContext.Provider>');
  }
  return engine;
}

export function useEngineOptional(): GlobeEngine | null {
  return useContext(EngineContext);
}
