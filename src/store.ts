import { reactive, computed } from 'vue'
import type { CategoryKey } from './types'
import { restaurants } from './data/restaurants'
import { distanceMeters } from './utils'

export type LocateStatus = 'idle' | 'locating' | 'ok' | 'error'

interface AppState {
  /** 当前选中的门店 id（点击标记或列表项时设置） */
  selectedId: string | null
  /** 分类筛选，null 表示全部 */
  activeCategory: CategoryKey | null
  /** 搜索关键词（匹配店名/地址/标签/必点菜） */
  keyword: string
  /** 我的定位坐标 [lng, lat] */
  userPos: [number, number] | null
  locateStatus: LocateStatus
  /** FAB 点击计数器：MapView 监听变化后执行定位 */
  locateTick: number
  /** 是否按「距我最近」排序（需要定位成功） */
  sortByDistance: boolean
  mapReady: boolean
  /** 全局轻提示 */
  toast: string
  toastTick: number
}

export const store = reactive<AppState>({
  selectedId: null,
  activeCategory: null,
  keyword: '',
  userPos: null,
  locateStatus: 'idle',
  locateTick: 0,
  sortByDistance: false,
  mapReady: false,
  toast: '',
  toastTick: 0,
})

let toastTimer: ReturnType<typeof setTimeout> | undefined

/** 弹一条轻提示，2.6s 后自动消失 */
export function pushToast(message: string) {
  store.toast = message
  store.toastTick += 1
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (store.toast = ''), 2600)
}

/** 请求一次定位（由 MapView 实际执行） */
export function requestLocate() {
  store.locateTick += 1
}

function matchKeyword(r: (typeof restaurants)[number], kw: string): boolean {
  const hay = [r.name, r.address, r.district, r.note, ...r.tags, ...r.mustOrder]
    .join(' ')
    .toLowerCase()
  return hay.includes(kw.toLowerCase())
}

/** 经过分类 + 关键词过滤后的门店列表 */
export const filteredRestaurants = computed(() => {
  const kw = store.keyword.trim()
  return restaurants.filter((r) => {
    if (store.activeCategory && r.category !== store.activeCategory) return false
    if (kw && !matchKeyword(r, kw)) return false
    return true
  })
})

/** 面板最终展示列表（可选按距我排序） */
export const displayedRestaurants = computed(() => {
  const list = filteredRestaurants.value.map((r) => ({
    ...r,
    distance: store.userPos
      ? distanceMeters(store.userPos, [r.lng, r.lat])
      : null,
  }))
  if (store.sortByDistance && store.userPos) {
    list.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
  }
  return list
})

export const selectedRestaurant = computed(
  () => restaurants.find((r) => r.id === store.selectedId) ?? null,
)
