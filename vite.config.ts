import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const cesiumSrc = 'node_modules/cesium/Build/Cesium';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: `${cesiumSrc}/Workers`, dest: 'cesium' },
        { src: `${cesiumSrc}/Assets`, dest: 'cesium' },
        { src: `${cesiumSrc}/Widgets`, dest: 'cesium' },
        { src: `${cesiumSrc}/ThirdParty`, dest: 'cesium' },
      ],
    }),
  ],
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium/'),
  },
  server: {
    port: 5173,
  },
});
