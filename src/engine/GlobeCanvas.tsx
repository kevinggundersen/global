import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Ellipsoid } from 'cesium';
import { GlobeEngine, type GlobeSnapshot } from './GlobeEngine';
import { EngineContext } from './EngineContext';
import { ProviderRegistry } from '../layers/ProviderRegistry';
import { registerAllProviders } from '../layers/providers';
import { DEFAULT_PROJECTION_ID, getProjection } from '../projections/registry';

interface Props {
  children: ReactNode;
  defaultLayers?: string[];
  projectionId?: string;
}

export function GlobeCanvas({
  children,
  defaultLayers = ['esri-world-imagery'],
  projectionId = DEFAULT_PROJECTION_ID,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [engine, setEngine] = useState<GlobeEngine | null>(null);
  const pendingSnapshotRef = useRef<GlobeSnapshot | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const registry = new ProviderRegistry();
    registerAllProviders(registry);

    const projection = getProjection(projectionId).create(Ellipsoid.WGS84);
    const instance = new GlobeEngine({
      container: containerRef.current,
      registry,
      mapProjection: projection,
    });

    const snapshot = pendingSnapshotRef.current;
    pendingSnapshotRef.current = null;

    let cancelled = false;
    let ready = false;
    (async () => {
      if (snapshot) {
        await instance.restore(snapshot);
      } else {
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
      }
      ready = true;
      if (!cancelled && !instance.viewer.isDestroyed()) setEngine(instance);
    })();

    return () => {
      cancelled = true;
      if (ready && !instance.viewer.isDestroyed()) {
        pendingSnapshotRef.current = instance.snapshot();
      }
      instance.destroy();
      setEngine(null);
    };
  }, [defaultLayers, projectionId]);

  return (
    <div className="globe-canvas-wrapper">
      <div ref={containerRef} className="globe-canvas" />
      {engine && <EngineContext.Provider value={engine}>{children}</EngineContext.Provider>}
    </div>
  );
}
