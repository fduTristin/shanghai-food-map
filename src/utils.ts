/** 哈弗辛公式计算两个 GCJ-02 经纬度之间的距离（米） */
export function distanceMeters(
  a: [number, number],
  b: [number, number],
): number {
  const rad = Math.PI / 180
  const dLat = (b[1] - a[1]) * rad
  const dLng = (b[0] - a[0]) * rad
  const lat1 = a[1] * rad
  const lat2 = b[1] * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h))
}

/** 「850 m」/「1.2 km」 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
}

/** 高德「到这里去」导航直达链接（无需后端） */
export function amapNaviUrl(lng: number, lat: number, name: string): string {
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(name)}&src=shanghai-food-map&coordinate=gaode&callnative=1`
}
