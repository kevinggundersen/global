import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GlobeEngine } from './GlobeEngine';
import { EngineContext } from './EngineContext';
import { ProviderRegistry } from '../layers/ProviderRegistry';
import { registerAllProviders } from '../layers/providers';

interface Props {
  children: ReactNode;
  defaultLayers?: string[];
}

export function GlobeCanvas({ children, defaultLayers = ['esri-world-imagery'] }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [engine, setEngine] = useState<GlobeEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const registry = new ProviderRegistry();
    registerAllProviders(registry);

    const instance = new GlobeEngine({
      container: containerRef.current,
      registry,
    });

    let cancelled = false;
    (async () => {
      for (const id of defaultLayers) {
        if (cancelled || instance.viewer.isDestroyed()) return;
        try {
          await instance.layers.add(id);
        } catch (err) {
          if (!instance.viewer.isDestroyed()) {
            console.error(`Failed to add default layer ${id}:`, err);
          }
        }
      }
      if (!cancelled && !instance.viewer.isDestroyed()) setEngine(instance);
    })();

    return () => {
      cancelled = true;
      instance.destroy();
      setEngine(null);
    };
  }, [defaultLayers]);

  return (
    <div className="globe-canvas-wrapper">
      <div ref={containerRef} className="globe-canvas" />
      {engine && <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>}
    </div>
  );
}
