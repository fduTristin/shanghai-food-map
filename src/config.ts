/** 高德 JS API 配置（从 .env 读取，见 .env.example） */
export const AMAP_KEY = import.meta.env.VITE_AMAP_KEY ?? ''
export const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE ?? ''

/** 是否已正确填写 Key 和安全密钥 */
export const isAmapConfigured =
  Boolean(AMAP_KEY) &&
  Boolean(AMAP_SECURITY_CODE) &&
  !AMAP_KEY.startsWith('你的') &&
  !AMAP_SECURITY_CODE.startsWith('你的')

/** 上海中心（人民广场），保留备用 */
export const SHANGHAI_CENTER: [number, number] = [121.4737, 31.2304]

/**
 * 首开视野只包「市中心」门店：在此矩形范围内才参与 fitView，
 * 远郊门店不撑大初始视野（缩放/搜索后仍然能看到它们）。
 * [西经度, 南纬度, 东经度, 北纬度]，约覆盖内环+周边一圈
 */
export const DOWNTOWN_BOUNDS = [121.4, 31.18, 121.52, 31.27] as const

export function inDowntown(lng: number, lat: number): boolean {
  const [w, s, e, n] = DOWNTOWN_BOUNDS
  return lng >= w && lng <= e && lat >= s && lat <= n
}

/** 高德地图浅色样式（干净白底，配彩色分类标记） */
export const MAP_STYLE = 'amap://styles/whitesmoke'
