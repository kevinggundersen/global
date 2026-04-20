import { useState } from 'react';
import { useEngine } from '../engine/EngineContext';
import { useLayers } from './useLayers';
import type { ProviderDescriptor } from '../layers/types';

export function LayerPanel() {
  const engine = useEngine();
  const active = useLayers();
  const all = engine.registry.listByKind('imagery');
  const [expanded, setExpanded] = useState(true);

  const activeIds = new Set(active.map((l) => l.id));
  const activeWarning = active.find(
    (l) => l.descriptor.usage === 'dev-only' && l.visible,
  )?.descriptor.usageWarning;

  return (
    <section className={`panel layer-panel ${expanded ? 'open' : 'closed'}`}>
      <header>
        <button type="button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '▾' : '▸'} Layers
        </button>
      </header>

      {expanded && (
        <div className="panel-body">
          {activeWarning && <div className="warning">{activeWarning}</div>}

          <h4>Active ({active.length})</h4>
          <ul className="active-list">
            {active.length === 0 && <li className="muted">No active layers</li>}
            {active.map((layer) => (
              <li key={layer.id} className="active-row">
                <div className="row-top">
                  <label>
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={(e) => engine.layers.setVisible(layer.id, e.target.checked)}
                    />
                    <span className="label">{layer.descriptor.label}</span>
                  </label>
                  <div className="row-actions">
                    <button type="button" title="Move up" onClick={() => engine.layers.move(layer.id, 'up')}>
                      ▲
                    </button>
                    <button type="button" title="Move down" onClick={() => engine.layers.move(layer.id, 'down')}>
                      ▼
                    </button>
                    <button type="button" title="Remove" onClick={() => engine.layers.remove(layer.id)}>
                      ✕
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={layer.opacity}
                  onChange={(e) => engine.layers.setOpacity(layer.id, parseFloat(e.target.value))}
                />
              </li>
            ))}
          </ul>

          <h4>Available</h4>
          <ul className="available-list">
            {all
              .filter((d) => !activeIds.has(d.id))
              .map((d) => (
                <li key={d.id}>
                  <button type="button" onClick={() => engine.layers.add(d.id)}>
                    + {d.label}
                    {d.usage === 'dev-only' && <span className="badge">dev</span>}
                  </button>
                  <span className="category">{categoryLabel(d)}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function categoryLabel(d: ProviderDescriptor): string {
  return d.category;
}
