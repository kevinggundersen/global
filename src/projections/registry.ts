import { GeographicProjection, WebMercatorProjection } from 'cesium';
import type { ProjectionDescriptor } from './types';
import { MillerProjection } from './MillerProjection';
import { LambertCylindricalEqualAreaProjection } from './LambertCylindricalEqualAreaProjection';

const DEFAULT_PROJECTION: ProjectionDescriptor = {
  id: 'web-mercator',
  label: 'Web Mercator',
  kind: 'builtin',
  create: (ellipsoid) => new WebMercatorProjection(ellipsoid),
};

export const PROJECTIONS: ProjectionDescriptor[] = [
  DEFAULT_PROJECTION,
  {
    id: 'geographic',
    label: 'Equirectangular',
    kind: 'builtin',
    create: (ellipsoid) => new GeographicProjection(ellipsoid),
  },
  {
    id: 'miller',
    label: 'Miller',
    kind: 'custom',
    create: (ellipsoid) => new MillerProjection(ellipsoid),
  },
  {
    id: 'lambert-cea',
    label: 'Lambert Cylindrical Equal Area',
    kind: 'custom',
    create: (ellipsoid) => new LambertCylindricalEqualAreaProjection(ellipsoid),
  },
];

export const DEFAULT_PROJECTION_ID = DEFAULT_PROJECTION.id;

export function getProjection(id: string): ProjectionDescriptor {
  return PROJECTIONS.find((p) => p.id === id) ?? DEFAULT_PROJECTION;
}
