import {
  Cartesian3,
  EllipsoidTerrainProvider,
  Ion,
  type MapProjection,
  Math as CesiumMath,
  SceneMode,
  Viewer,
} from 'cesium';
import { ProviderRegistry } from '../layers/ProviderRegistry';
import { LayerManager } from '../layers/LayerManager';

export type SceneModeName = '3d' | 'columbus' | '2d' | 'morphing';

export interface GlobeEngineOptions {
  container: HTMLElement;
  registry: ProviderRegistry;
  mapProjection?: MapProjection;
}

export interface LayerSnapshot {
  id: string;
  opacity: number;
  visible: boolean;
}

export interface CameraSnapshot {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

export interface GlobeSnapshot {
  camera: CameraSnapshot | null;
  layers: LayerSnapshot[];
  sceneMode: Exclude<SceneModeName, 'morphing'>;
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
      mapProjection: options.mapProjection,
    });

    this.viewer.scene.globe.enableLighting = false;
    if (this.viewer.scene.skyAtmosphere) {
      this.viewer.scene.skyAtmosphere.show = true;
    }

    this.layers = new LayerManager(this.viewer, this.registry);
  }

  morphTo(mode: Exclude<SceneModeName, 'morphing'>, duration = 2): void {
    const scene = this.viewer.scene;
    if (mode === '3d') scene.morphTo3D(duration);
    else if (mode === '2d') scene.morphTo2D(duration);
    else scene.morphToColumbusView(duration);
  }

  getSceneMode(): SceneModeName {
    switch (this.viewer.scene.mode) {
      case SceneMode.SCENE3D:
        return '3d';
      case SceneMode.SCENE2D:
        return '2d';
      case SceneMode.COLUMBUS_VIEW:
        return 'columbus';
      default:
        return 'morphing';
    }
  }

  snapshot(): GlobeSnapshot {
    const camera = this.viewer.camera;
    const carto = camera.positionCartographic;
    const sceneMode = this.getSceneMode();
    return {
      camera: carto
        ? {
            longitude: carto.longitude,
            latitude: carto.latitude,
            height: carto.height,
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll,
          }
        : null,
      layers: this.layers.snapshot().map((l) => ({
        id: l.id,
        opacity: l.opacity,
        visible: l.visible,
      })),
      sceneMode: sceneMode === 'morphing' ? '3d' : sceneMode,
    };
  }

  async restore(snap: GlobeSnapshot): Promise<void> {
    for (const l of snap.layers) {
      try {
        await this.layers.add(l.id);
        this.layers.setOpacity(l.id, l.opacity);
        this.layers.setVisible(l.id, l.visible);
      } catch (err) {
        if (!this.viewer.isDestroyed()) {
          console.error(`Failed to restore layer ${l.id}:`, err);
        }
      }
    }

    if (snap.camera) {
      this.viewer.camera.setView({
        destination: Cartesian3.fromRadians(
          snap.camera.longitude,
          snap.camera.latitude,
          snap.camera.height,
        ),
        orientation: {
          heading: snap.camera.heading,
          pitch: snap.camera.pitch,
          roll: snap.camera.roll,
        },
      });
    }

    if (snap.sceneMode !== '3d') {
      this.morphTo(snap.sceneMode, 0);
    }
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
