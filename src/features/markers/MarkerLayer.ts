import {
  Cartesian3,
  Color,
  Entity,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  type Viewer,
  VerticalOrigin,
  HeightReference,
} from 'cesium';
import { MarkerStore, type Marker } from './MarkerStore';

export class MarkerLayer {
  private readonly entities = new Map<string, Entity>();
  private readonly handler: ScreenSpaceEventHandler;
  private unsubscribe: (() => void) | null = null;
  private clickEnabled = true;
  private counter = 1;

  constructor(
    private readonly viewer: Viewer,
    readonly store: MarkerStore,
  ) {
    this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handler.setInputAction((event: ScreenSpaceEventHandler.PositionedEvent) => {
      if (!this.clickEnabled) return;
      const cartesian = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
      if (!cartesian) return;
      const carto = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      const lon = (carto.longitude * 180) / Math.PI;
      const lat = (carto.latitude * 180) / Math.PI;
      this.store.add({ name: `Marker ${this.counter++}`, lon, lat });
    }, ScreenSpaceEventType.LEFT_CLICK);

    this.unsubscribe = store.subscribe((markers) => this.sync(markers));
  }

  setClickToAddEnabled(enabled: boolean): void {
    this.clickEnabled = enabled;
  }

  private sync(markers: Marker[]): void {
    const currentIds = new Set(markers.map((m) => m.id));
    for (const [id, entity] of this.entities) {
      if (!currentIds.has(id)) {
        this.viewer.entities.remove(entity);
        this.entities.delete(id);
      }
    }
    for (const m of markers) {
      let entity = this.entities.get(m.id);
      if (!entity) {
        entity = this.viewer.entities.add({
          id: m.id,
          position: Cartesian3.fromDegrees(m.lon, m.lat),
          point: {
            pixelSize: 10,
            color: Color.fromCssColorString('#ff5252'),
            outlineColor: Color.WHITE,
            outlineWidth: 2,
            heightReference: HeightReference.CLAMP_TO_GROUND,
          },
          label: {
            text: m.name,
            font: '12px sans-serif',
            fillColor: Color.WHITE,
            outlineColor: Color.BLACK,
            outlineWidth: 2,
            style: 2,
            pixelOffset: new Cartesian3(0, -16, 0),
            verticalOrigin: VerticalOrigin.BOTTOM,
            showBackground: true,
            backgroundColor: Color.fromCssColorString('rgba(0,0,0,0.6)'),
          },
        });
        this.entities.set(m.id, entity);
      } else {
        entity.position = Cartesian3.fromDegrees(m.lon, m.lat) as never;
        if (entity.label) entity.label.text = m.name as never;
      }
    }
  }

  destroy(): void {
    this.handler.destroy();
    this.unsubscribe?.();
    if (!this.viewer.isDestroyed()) {
      for (const entity of this.entities.values()) {
        this.viewer.entities.remove(entity);
      }
    }
    this.entities.clear();
  }
}
