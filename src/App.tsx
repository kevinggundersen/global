import { useState } from 'react';
import { GlobeCanvas } from './engine/GlobeCanvas';
import { LayerPanel } from './ui/LayerPanel';
import { AttributionBar } from './ui/AttributionBar';
import { MorphToggle } from './ui/MorphToggle';
import { ProjectionPicker } from './ui/ProjectionPicker';
import { SearchBox } from './features/search';
import { MarkerPanel } from './features/markers';
import { DEFAULT_PROJECTION_ID } from './projections/registry';

export function App() {
  const [projectionId, setProjectionId] = useState(DEFAULT_PROJECTION_ID);

  return (
    <div className="app">
      <GlobeCanvas defaultLayers={['esri-world-imagery']} projectionId={projectionId}>
        <div className="top-bar">
          <h1 className="app-title">Global</h1>
          <SearchBox />
          <MorphToggle />
          <ProjectionPicker value={projectionId} onChange={setProjectionId} />
        </div>
        <aside className="side-panel">
          <LayerPanel />
          <MarkerPanel />
        </aside>
        <AttributionBar />
      </GlobeCanvas>
    </div>
  );
}
