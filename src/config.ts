/** 高德 JS API 配置（从 .env 读取，见 .env.example） */
export const AMAP_KEY = import.meta.env.VITE_AMAP_KEY ?? ''
export const AMAP_SECURITY_CODE = import.meta.env.VITE_AMAP_SECURITY_CODE ?? ''

/** 是否已正确填写 Key 和安全密钥 */
export const isAmapConfigured =
  Boolean(AMAP_KEY) &&
  Boolean(AMAP_SECURITY_CODE) &&
  !AMAP_KEY.startsWith('你的') &&
  !AMAP_SECURITY_CODE.startsWith('你的')

/** 上海中心（人民广场），首次加载落点 */
export const SHANGHAI_CENTER: [number, number] = [121.4737, 31.2304]

/** 高德地图浅色样式（干净白底，配彩色分类标记） */
export const MAP_STYLE = 'amap://styles/whitesmoke'
