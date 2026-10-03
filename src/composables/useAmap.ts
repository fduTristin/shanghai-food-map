import AMapLoader from '@amap/amap-jsapi-loader'
import { AMAP_KEY, AMAP_SECURITY_CODE } from '../config'

let amapPromise: Promise<typeof AMap> | null = null

/**
 * 加载高德 JS API（单例）。
 * 安全密钥必须在脚本加载前挂到 window._AMapSecurityConfig（2021.12 起强制）。
 */
export function loadAmap(): Promise<typeof AMap> {
  if (!amapPromise) {
    ;(window as unknown as Record<string, unknown>)._AMapSecurityConfig = {
      securityJsCode: AMAP_SECURITY_CODE,
    }
    amapPromise = AMapLoader.load({
      key: AMAP_KEY,
      version: '2.0',
      plugins: ['AMap.Geolocation'],
    }) as Promise<typeof AMap>
  }
  return amapPromise
}
