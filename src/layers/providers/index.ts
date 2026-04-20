import type { ProviderRegistry } from '../ProviderRegistry';
import { esriWorldImageryFactory } from './esriWorldImagery';
import { nasaGibsModisFactory } from './nasaGibsModis';
import { nasaGibsViirsFactory } from './nasaGibsViirs';
import { cartoVoyagerFactory } from './cartoVoyager';
import { openTopoMapFactory } from './openTopoMap';
import { osmStandardFactory } from './osmStandard';

export function registerAllProviders(registry: ProviderRegistry): void {
  registry.register(esriWorldImageryFactory);
  registry.register(nasaGibsModisFactory);
  registry.register(nasaGibsViirsFactory);
  registry.register(cartoVoyagerFactory);
  registry.register(openTopoMapFactory);
  registry.register(osmStandardFactory);
}

export {
  esriWorldImageryFactory,
  nasaGibsModisFactory,
  nasaGibsViirsFactory,
  cartoVoyagerFactory,
  openTopoMapFactory,
  osmStandardFactory,
};
