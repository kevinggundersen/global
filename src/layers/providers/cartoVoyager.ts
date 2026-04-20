import { UrlTemplateImageryProvider } from 'cesium';
import type { ProviderFactory } from '../types';

export const cartoVoyagerFactory: ProviderFactory = {
  descriptor: {
    id: 'carto-voyager',
    kind: 'imagery',
    label: 'CARTO Voyager (streets)',
    category: 'streets',
    maxZoom: 19,
    usage: 'public',
    attribution: {
      text: '© OpenStreetMap contributors, © CARTO',
      url: 'https://carto.com/attributions',
    },
  },
  create() {
    return new UrlTemplateImageryProvider({
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
      subdomains: ['a', 'b', 'c', 'd'],
      maximumLevel: 19,
      credit: '© OpenStreetMap contributors, © CARTO',
    });
  },
};
