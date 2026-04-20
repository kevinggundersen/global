declare global {
  // eslint-disable-next-line no-var
  var CESIUM_BASE_URL: string;
}

window.CESIUM_BASE_URL = '/cesium/';

import React from 'react';
import { createRoot } from 'react-dom/client';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { App } from './App';
import './ui/styles.css';

const el = document.getElementById('root');
if (!el) throw new Error('#root not found');
createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
