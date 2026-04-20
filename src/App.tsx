import { GlobeCanvas } from './engine/GlobeCanvas';
import { LayerPanel } from './ui/LayerPanel';
import { AttributionBar } from './ui/AttributionBar';
import { SearchBox } from './features/search';
import { MarkerPanel } from './features/markers';

export function App() {
  return (
    <div className="app">
      <GlobeCanvas defaultLayers={['esri-world-imagery']}>
        <div className="top-bar">
          <h1 className="app-title">Global</h1>
          <SearchBox />
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
