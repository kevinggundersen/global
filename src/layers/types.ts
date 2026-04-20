import type { ImageryProvider, TerrainProvider } from 'cesium';

export type ProviderKind = 'imagery' | 'terrain';

export type UsageLevel = 'public' | 'dev-only';

export interface Attribution {
  readonly text: string;
  readonly url?: string;
}

export interface ProviderDescriptor {
  readonly id: string;
  readonly kind: ProviderKind;
  readonly label: string;
  readonly category: 'satellite' | 'streets' | 'topo' | 'hybrid' | 'terrain';
  readonly attribution: Attribution;
  readonly usage: UsageLevel;
  readonly usageWarning?: string;
  readonly maxZoom?: number;
  readonly defaultVisible?: boolean;
}

export type ProviderInstance = ImageryProvider | TerrainProvider;

export interface ProviderFactory<T extends ProviderInstance = ProviderInstance> {
  readonly descriptor: ProviderDescriptor;
  create(options?: Record<string, unknown>): Promise<T> | T;
}

export interface ActiveLayer {
  readonly id: string;
  readonly descriptor: ProviderDescriptor;
  visible: boolean;
  opacity: number;
  order: number;
}
