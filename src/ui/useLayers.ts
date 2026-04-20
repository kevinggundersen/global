import { useEffect, useState } from 'react';
import type { ActiveLayer } from '../layers/types';
import { useEngine } from '../engine/EngineContext';

export function useLayers(): ActiveLayer[] {
  const engine = useEngine();
  const [layers, setLayers] = useState<ActiveLayer[]>(() => engine.layers.snapshot());
  useEffect(() => engine.layers.subscribe(setLayers), [engine]);
  return layers;
}
