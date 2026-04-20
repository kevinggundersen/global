import { useLayers } from './useLayers';
import type { Attribution } from '../layers/types';

export function AttributionBar() {
  const layers = useLayers();
  const seen = new Set<string>();
  const attributions: Attribution[] = [];
  for (const layer of layers) {
    if (!layer.visible) continue;
    const key = layer.descriptor.attribution.text;
    if (seen.has(key)) continue;
    seen.add(key);
    attributions.push(layer.descriptor.attribution);
  }

  return (
    <div className="attribution-bar">
      <span className="attribution-label">Data:</span>
      {attributions.map((a, i) => (
        <span key={a.text}>
          {i > 0 && <span className="sep"> · </span>}
          {a.url ? (
            <a href={a.url} target="_blank" rel="noreferrer noopener">
              {a.text}
            </a>
          ) : (
            <span>{a.text}</span>
          )}
        </span>
      ))}
      <span className="sep"> · </span>
      <a href="https://cesium.com/" target="_blank" rel="noreferrer noopener">
        Powered by Cesium
      </a>
    </div>
  );
}
