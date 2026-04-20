import { useEffect, useRef, useState } from 'react';
import { useEngine } from '../../engine/EngineContext';
import { MarkerStore, type Marker } from './MarkerStore';
import { MarkerLayer } from './MarkerLayer';
import { downloadGeoJson, geoJsonToMarkers } from './GeoJsonIO';

export function MarkerPanel() {
  const engine = useEngine();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [clickToAdd, setClickToAdd] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const layerRef = useRef<MarkerLayer | null>(null);
  const storeRef = useRef<MarkerStore | null>(null);

  useEffect(() => {
    const store = new MarkerStore();
    storeRef.current = store;
    const layer = new MarkerLayer(engine.viewer, store);
    layerRef.current = layer;
    const unsubscribe = store.subscribe(setMarkers);
    return () => {
      unsubscribe();
      layer.destroy();
      layerRef.current = null;
      storeRef.current = null;
    };
  }, [engine]);

  useEffect(() => {
    layerRef.current?.setClickToAddEnabled(clickToAdd);
  }, [clickToAdd]);

  const onImportFile = async (file: File) => {
    setError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const imported = geoJsonToMarkers(parsed);
      const existing = storeRef.current?.list() ?? [];
      storeRef.current?.replaceAll([...existing, ...imported]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    }
  };

  const flyTo = (m: Marker) => engine.flyTo(m.lon, m.lat, 50_000);

  return (
    <section className={`panel marker-panel ${expanded ? 'open' : 'closed'}`}>
      <header>
        <button type="button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '▾' : '▸'} Markers ({markers.length})
        </button>
      </header>
      {expanded && (
        <div className="panel-body">
          <label className="click-toggle">
            <input
              type="checkbox"
              checked={clickToAdd}
              onChange={(e) => setClickToAdd(e.target.checked)}
            />
            Click globe to drop marker
          </label>

          <div className="marker-actions">
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              Import GeoJSON
            </button>
            <button
              type="button"
              disabled={markers.length === 0}
              onClick={() => downloadGeoJson(markers)}
            >
              Export GeoJSON
            </button>
            <button
              type="button"
              disabled={markers.length === 0}
              onClick={() => storeRef.current?.replaceAll([])}
            >
              Clear
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".geojson,application/geo+json,application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImportFile(file);
                e.target.value = '';
              }}
            />
          </div>

          {error && <div className="error">{error}</div>}

          <ul className="marker-list">
            {markers.length === 0 && (
              <li className="muted">No markers yet. Click the globe to add one.</li>
            )}
            {markers.map((m) => (
              <li key={m.id}>
                <button type="button" className="marker-name" onClick={() => flyTo(m)}>
                  {m.name}
                </button>
                <span className="coords">
                  {m.lat.toFixed(3)}, {m.lon.toFixed(3)}
                </span>
                <button
                  type="button"
                  className="remove"
                  onClick={() => storeRef.current?.remove(m.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
