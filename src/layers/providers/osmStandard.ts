import { UrlTemplateImageryProvider } from 'cesium';
import type { ProviderFactory } from '../types';

export const osmStandardFactory: ProviderFactory = {
  descriptor: {
    id: 'osm-standard',
    kind: 'imagery',
    label: 'OpenStreetMap standard (dev only)',
    category: 'streets',
    maxZoom: 19,
    usage: 'dev-only',
    usageWarning:
      'tile.openstreetmap.org is not for production / heavy-use apps. Self-host tiles (openstreetmap-tile-server Docker) or use a commercial mirror for anything beyond local development.',
    attribution: {
      text: '© OpenStreetMap contributors',
      url: 'https://www.openstreetmap.org/copyright',
    },
  },
  create() {
    return new UrlTemplateImageryProvider({
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      maximumLevel: 19,
      credit: '© OpenStreetMap contributors',
    });
  },
};
