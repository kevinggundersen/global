import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium';
import type { ProviderFactory } from '../types';

function yesterdayUtc(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const nasaGibsViirsFactory: ProviderFactory = {
  descriptor: {
    id: 'nasa-gibs-viirs',
    kind: 'imagery',
    label: 'NASA GIBS — VIIRS SNPP (True Color)',
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
    const layer = 'VIIRS_SNPP_CorrectedReflectance_TrueColor';
    const url = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
    return new UrlTemplateImageryProvider({
      url,
      tilingScheme: new WebMercatorTilingScheme(),
      maximumLevel: 9,
      credit: 'NASA EOSDIS GIBS',
    });
  },
};
