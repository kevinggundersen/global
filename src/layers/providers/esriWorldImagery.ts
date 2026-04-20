import { UrlTemplateImageryProvider } from 'cesium';
import type { ProviderFactory } from '../types';

export const esriWorldImageryFactory: ProviderFactory = {
  descriptor: {
    id: 'esri-world-imagery',
    kind: 'imagery',
    label: 'ESRI World Imagery',
    category: 'satellite',
    maxZoom: 19,
    usage: 'public',
    defaultVisible: true,
    attribution: {
      text: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
      url: 'https://www.esri.com/en-us/legal/terms/data-attributions',
    },
  },
  create() {
    return new UrlTemplateImageryProvider({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maximumLevel: 19,
      credit: 'Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    });
  },
};
