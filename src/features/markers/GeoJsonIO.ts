import type { Marker } from './MarkerStore';

interface GeoJsonPointFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: Record<string, unknown>;
}

interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJsonPointFeature[];
}

export function markersToGeoJson(markers: Marker[]): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: markers.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lon, m.lat] },
      properties: {
        id: m.id,
        name: m.name,
        ...(m.description ? { description: m.description } : {}),
      },
    })),
  };
}

export function geoJsonToMarkers(input: unknown): Marker[] {
  if (!isObject(input)) throw new Error('GeoJSON root must be an object');
  if (input.type !== 'FeatureCollection') throw new Error('Expected FeatureCollection');
  if (!Array.isArray(input.features)) throw new Error('features must be an array');

  const results: Marker[] = [];
  for (const feature of input.features) {
    if (!isObject(feature) || feature.type !== 'Feature') continue;
    const geometry = feature.geometry;
    if (!isObject(geometry) || geometry.type !== 'Point') continue;
    const coords = geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) continue;
    const [lon, lat] = coords;
    if (typeof lon !== 'number' || typeof lat !== 'number') continue;
    const props = isObject(feature.properties) ? feature.properties : {};
    results.push({
      id: typeof props.id === 'string' ? props.id : crypto.randomUUID(),
      name: typeof props.name === 'string' ? props.name : 'Imported marker',
      lon,
      lat,
      description: typeof props.description === 'string' ? props.description : undefined,
    });
  }
  return results;
}

export function downloadGeoJson(markers: Marker[], filename = 'markers.geojson'): void {
  const blob = new Blob([JSON.stringify(markersToGeoJson(markers), null, 2)], {
    type: 'application/geo+json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
