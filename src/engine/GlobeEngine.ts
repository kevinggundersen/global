import {
  Cartesian3,
  EllipsoidTerrainProvider,
  Ion,
  Math as CesiumMath,
  Viewer,
} from 'cesium';
import { ProviderRegistry } from '../layers/ProviderRegistry';
import { LayerManager } from '../layers/LayerManager';

export interface GlobeEngineOptions {
  container: HTMLElement;
  registry: ProviderRegistry;
}

export class GlobeEngine {
  readonly viewer: Viewer;
  readonly registry: ProviderRegistry;
  readonly layers: LayerManager;

  constructor(options: GlobeEngineOptions) {
    Ion.defaultAccessToken = '';

    this.registry = options.registry;
    this.viewer = new Viewer(options.container, {
      baseLayer: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      terrainProvider: new EllipsoidTerrainProvider(),
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    });

    this.viewer.scene.globe.enableLighting = false;
    if (this.viewer.scene.skyAtmosphere) {
      this.viewer.scene.skyAtmosphere.show = true;
    }

    this.layers = new LayerManager(this.viewer, this.registry);
  }

  flyTo(lon: number, lat: number, altitudeMeters = 1_500_000): void {
    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(lon, lat, altitudeMeters),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-90),
        roll: 0,
      },
      duration: 1.8,
    });
  }

  destroy(): void {
    if (!this.viewer.isDestroyed()) {
      this.viewer.destroy();
    }
  }
}
