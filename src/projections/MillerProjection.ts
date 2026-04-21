import { Cartesian3, Cartographic, Ellipsoid, type MapProjection } from 'cesium';

const FIVE_FOURTHS = 1.25;
const FOUR_FIFTHS = 0.8;

export class MillerProjection implements MapProjection {
  readonly ellipsoid: Ellipsoid;
  private readonly semimajorAxis: number;

  constructor(ellipsoid: Ellipsoid = Ellipsoid.WGS84) {
    this.ellipsoid = ellipsoid;
    this.semimajorAxis = ellipsoid.maximumRadius;
  }

  project(cartographic: Cartographic, result?: Cartesian3): Cartesian3 {
    const r = this.semimajorAxis;
    const x = r * cartographic.longitude;
    const y = r * FIVE_FOURTHS * Math.asinh(Math.tan(FOUR_FIFTHS * cartographic.latitude));
    const z = cartographic.height;
    if (!result) return new Cartesian3(x, y, z);
    result.x = x;
    result.y = y;
    result.z = z;
    return result;
  }

  unproject(cartesian: Cartesian3, result?: Cartographic): Cartographic {
    const r = this.semimajorAxis;
    const longitude = cartesian.x / r;
    const latitude =
      FIVE_FOURTHS * Math.atan(Math.sinh(FOUR_FIFTHS * (cartesian.y / r)));
    const height = cartesian.z;
    if (!result) return new Cartographic(longitude, latitude, height);
    result.longitude = longitude;
    result.latitude = latitude;
    result.height = height;
    return result;
  }
}
