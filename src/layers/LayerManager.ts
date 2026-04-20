import { ImageryLayer, type ImageryProvider, type Viewer } from 'cesium';
import type { ActiveLayer, ProviderDescriptor } from './types';
import type { ProviderRegistry } from './ProviderRegistry';

type Listener = (layers: ActiveLayer[]) => void;

interface LayerEntry {
  readonly descriptor: ProviderDescriptor;
  readonly cesiumLayer: ImageryLayer;
  state: ActiveLayer;
}

export class LayerManager {
  private readonly entries = new Map<string, LayerEntry>();
  private readonly listeners = new Set<Listener>();

  constructor(
    private readonly viewer: Viewer,
    private readonly registry: ProviderRegistry,
  ) {}

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): ActiveLayer[] {
    return [...this.entries.values()]
      .map((e) => ({ ...e.state }))
      .sort((a, b) => a.order - b.order);
  }

  async add(id: string, options?: Record<string, unknown>): Promise<void> {
    if (this.entries.has(id)) return;
    const factory = this.registry.get(id);
    if (!factory) throw new Error(`Unknown provider: ${id}`);
    if (factory.descriptor.kind !== 'imagery') {
      throw new Error(`LayerManager only manages imagery providers, got ${factory.descriptor.kind}`);
    }
    const provider = (await factory.create(options)) as ImageryProvider;
    if (this.viewer.isDestroyed()) return;
    const cesiumLayer = this.viewer.imageryLayers.addImageryProvider(provider);
    cesiumLayer.alpha = 1;
    const order = this.entries.size;
    this.entries.set(id, {
      descriptor: factory.descriptor,
      cesiumLayer,
      state: {
        id,
        descriptor: factory.descriptor,
        visible: true,
        opacity: 1,
        order,
      },
    });
    this.emit();
  }

  remove(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.viewer.imageryLayers.remove(entry.cesiumLayer, true);
    this.entries.delete(id);
    this.reindex();
    this.emit();
  }

  setVisible(id: string, visible: boolean): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    entry.cesiumLayer.show = visible;
    entry.state.visible = visible;
    this.emit();
  }

  setOpacity(id: string, opacity: number): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    const clamped = Math.max(0, Math.min(1, opacity));
    entry.cesiumLayer.alpha = clamped;
    entry.state.opacity = clamped;
    this.emit();
  }

  move(id: string, direction: 'up' | 'down'): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    if (direction === 'up') {
      this.viewer.imageryLayers.raise(entry.cesiumLayer);
    } else {
      this.viewer.imageryLayers.lower(entry.cesiumLayer);
    }
    this.syncOrderFromViewer();
    this.emit();
  }

  activeAttributions(): ProviderDescriptor[] {
    return [...this.entries.values()]
      .filter((e) => e.state.visible)
      .map((e) => e.descriptor);
  }

  private syncOrderFromViewer(): void {
    const collection = this.viewer.imageryLayers;
    for (let i = 0; i < collection.length; i += 1) {
      const layer = collection.get(i);
      for (const entry of this.entries.values()) {
        if (entry.cesiumLayer === layer) {
          entry.state.order = i;
        }
      }
    }
  }

  private reindex(): void {
    const sorted = [...this.entries.values()].sort((a, b) => a.state.order - b.state.order);
    sorted.forEach((e, i) => {
      e.state.order = i;
    });
  }

  private emit(): void {
    const snap = this.snapshot();
    this.listeners.forEach((l) => l(snap));
  }
}
