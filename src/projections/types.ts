import type { Ellipsoid, MapProjection } from 'cesium';

export interface ProjectionDescriptor {
  readonly id: string;
  readonly label: string;
  readonly kind: 'builtin' | 'custom';
  readonly create: (ellipsoid: Ellipsoid) => MapProjection;
}
