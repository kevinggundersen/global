import { Cartesian3, Cartographic, Ellipsoid, type MapProjection } from 'cesium';

export class LambertCylindricalEqualAreaProjection implements MapProjection {
  readonly ellipsoid: Ellipsoid;
  private readonly semimajorAxis: number;

  constructor(ellipsoid: Ellipsoid = Ellipsoid.WGS84) {
    this.ellipsoid = ellipsoid;
    this.semimajorAxis = ellipsoid.maximumRadius;
  }

  project(cartographic: Cartographic, result?: Cartesian3): Cartesian3 {
    const r = this.semimajorAxis;
    const x = r * cartographic.longitude;
    const y = r * Math.sin(cartographic.latitude);
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
    const sinLat = Math.max(-1, Math.min(1, cartesian.y / r));
    const latitude = Math.asin(sinLat);
    const height = cartesian.z;
    if (!result) return new Cartographic(longitude, latitude, height);
    result.longitude = longitude;
    result.latitude = latitude;
    result.height = height;
    return result;
  }
}
