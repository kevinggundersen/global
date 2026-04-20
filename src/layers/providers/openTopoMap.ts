import { UrlTemplateImageryProvider } from 'cesium';
import type { ProviderFactory } from '../types';

export const openTopoMapFactory: ProviderFactory = {
  descriptor: {
    id: 'opentopomap',
    kind: 'imagery',
    label: 'OpenTopoMap (topographic)',
    category: 'topo',
    maxZoom: 17,
    usage: 'public',
    attribution: {
      text: '© OpenStreetMap contributors, SRTM — style © OpenTopoMap (CC-BY-SA)',
      url: 'https://opentopomap.org/about',
    },
  },
  create() {
    return new UrlTemplateImageryProvider({
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c'],
      maximumLevel: 17,
      credit: '© OpenTopoMap (CC-BY-SA)',
    });
  },
};
