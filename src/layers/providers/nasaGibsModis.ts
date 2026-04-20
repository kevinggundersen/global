import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium';
import type { ProviderFactory } from '../types';

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const nasaGibsModisFactory: ProviderFactory = {
  descriptor: {
    id: 'nasa-gibs-modis',
    kind: 'imagery',
    label: 'NASA GIBS — MODIS Terra (True Color)',
    category: 'satellite',
    maxZoom: 9,
    usage: 'public',
    attribution: {
      text: 'Imagery © NASA EOSDIS GIBS',
      url: 'https://nasa-gibs.github.io/gibs-api-docs/',
    },
  },
  create(options?: Record<string, unknown>) {
    const date = typeof options?.date === 'string' ? options.date : yesterdayUtc();
    const layer = 'MODIS_Terra_CorrectedReflectance_TrueColor';
    const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    return new UrlTemplateImageryProvider({
      url,
      tilingScheme: new WebMercatorTilingScheme(),
      maximumLevel: 9,
      credit: 'NASA EOSDIS GIBS',
    });
  },
};
