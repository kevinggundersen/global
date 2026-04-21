import { useEffect, useState } from 'react';
import { useEngine } from '../engine/EngineContext';
import type { SceneModeName } from '../engine/GlobeEngine';

const OPTIONS: { mode: Exclude<SceneModeName, 'morphing'>; label: string; title: string }[] = [
  { mode: '3d', label: '3D', title: '3D globe' },
  { mode: 'columbus', label: '2.5D', title: 'Columbus view (flat with height)' },
  { mode: '2d', label: '2D', title: '2D map using the active projection' },
];

export function MorphToggle() {
  const engine = useEngine();
  const [mode, setMode] = useState<SceneModeName>(() => engine.getSceneMode());

  useEffect(() => {
    const scene = engine.viewer.scene;
    const sync = () => setMode(engine.getSceneMode());
    sync();
    const startRemove = scene.morphStart.addEventListener(sync);
    const completeRemove = scene.morphComplete.addEventListener(sync);
    return () => {
      startRemove();
      completeRemove();
    };
  }, [engine]);

  return (
    <div className="projection-toggle" role="group" aria-label="Scene mode">
      {OPTIONS.map((opt) => (
        <button
          key={opt.mode}
          type="button"
          title={opt.title}
          aria-pressed={mode === opt.mode}
          className={mode === opt.mode ? 'active' : ''}
          disabled={mode === 'morphing'}
          onClick={() => engine.morphTo(opt.mode)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
