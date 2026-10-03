<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { loadAmap } from '../composables/useAmap'
import { MAP_STYLE, SHANGHAI_CENTER, inDowntown } from '../config'
import { categoryMap, restaurants } from '../data/restaurants'
import { filteredRestaurants, pushToast, store } from '../store'
import type { Restaurant } from '../types'
import { amapNaviUrl, distanceMeters, formatDistance } from '../utils'

const mapEl = ref<HTMLDivElement | null>(null)

let A: typeof AMap | null = null
let map: AMap.Map | null = null
const markers = new Map<string, AMap.Marker>()
const byId = new Map(restaurants.map((r) => [r.id, r]))
let infoWindow: AMap.InfoWindow | null = null
/** 信息窗当前打开的门店 id（用于 close 事件时同步取消选中） */
let infoForId: string | null = null
let userMarker: AMap.Marker | null = null
let userCircle: AMap.Circle | null = null

function markerHtml(color: string, active: boolean): string {
  return `<div class="poi-marker${active ? ' is-active' : ''}" style="--c:${color}"><i></i></div>`
}

function refreshMarkerStates() {
  markers.forEach((m, id) => {
    const r = byId.get(id)
    if (r) m.setContent(markerHtml(categoryMap[r.category].color, id === store.selectedId))
  })
}

function infoHtml(r: Restaurant): string {
  const cat = categoryMap[r.category]
  const dist = store.userPos
    ? formatDistance(distanceMeters(store.userPos, [r.lng, r.lat]))
    : null
  const metaParts: string[] = []
  if (r.price) metaParts.push(`人均 <b>¥${r.price}</b>`)
  if (dist) metaParts.push(`距我 <b>${dist}</b>`)
  return `
    <div class="poi-card">
      <button class="poi-close" type="button" aria-label="关闭">×</button>
      <header class="poi-head">
        <span class="poi-cat" style="--c:${cat.color}">${cat.label}</span>
        <h3 class="poi-name">${r.name}</h3>
      </header>
      <p class="poi-addr">${r.district} · ${r.address}</p>
      ${metaParts.length ? `<p class="poi-meta">${metaParts.join(' · ')}</p>` : ''}
      <p class="poi-note">${r.note}</p>
      ${
        r.mustOrder.length
          ? `<p class="poi-must"><span>必点</span>${r.mustOrder.join('、')}</p>`
          : ''
      }
      <a class="poi-navi" href="${amapNaviUrl(r.lng, r.lat, r.name)}" target="_blank" rel="noopener">
        导航到这里 ↗
      </a>
    </div>`
}

function openInfo(r: Restaurant) {
  if (!map || !infoWindow) return
  infoWindow.setContent(infoHtml(r))
  infoForId = r.id
  infoWindow.open(map, [r.lng, r.lat])
  requestAnimationFrame(() => {
    document.querySelector('.poi-close')?.addEventListener('click', () => {
      store.selectedId = null
    })
  })
}

/** 分类/关键词变化时，同步标记显隐 */
function applyFilter() {
  const visible = new Set(filteredRestaurants.value.map((r) => r.id))
  markers.forEach((m, id) => {
    if (visible.has(id)) m.show()
    else m.hide()
  })
  if (store.selectedId && !visible.has(store.selectedId)) store.selectedId = null
}

/**
 * 获取我的当前位置（高德定位插件）。
 * 注：Geolocation 为按需插件，类型包未将其挂在 AMap 命名空间上，故用 any。
 * 定位优先级：HTML5(GPS/WiFi) → IP 粗定位兜底；桌面端常走到 IP 兜底。
 * 如需「宁缺毋滥」可在下方 options 里加 noIpLocate: true 禁用 IP 兜底。
 */
function locate() {
  if (!A || !map || store.locateStatus === 'locating') return
  store.locateStatus = 'locating'
  const geo = new (A as any).Geolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    convert: true,
    showButton: false,
    showMarker: false,
    showCircle: false,
  })
  geo.getCurrentPosition((status: string, result: any) => {
    if (status === 'complete' && result?.position) {
      const pos: [number, number] = [
        result.position.getLng(),
        result.position.getLat(),
      ]
      store.userPos = pos
      store.locateStatus = 'ok'
      const accuracy =
        typeof result.accuracy === 'number' ? Math.max(result.accuracy, 25) : 40
      /** 定位来源：html5（GPS/WiFi，较准）/ ip（粗定位，可能偏差数公里） */
      const locateType: string = result.location_type ?? ''
      if (!userMarker) {
        userMarker = new A!.Marker({
          position: pos,
          content: '<div class="user-marker"><i></i></div>',
          anchor: 'center',
          zIndex: 300,
          bubble: true,
        })
        userMarker.setMap(map)
      } else {
        userMarker.setPosition(pos)
      }
      if (!userCircle) {
        userCircle = new A!.Circle({
          center: pos,
          radius: accuracy,
          strokeColor: '#2f80ed',
          strokeOpacity: 0.45,
          strokeWeight: 1,
          fillColor: '#2f80ed',
          fillOpacity: 0.12,
          zIndex: 250,
        })
        userCircle.setMap(map)
      } else {
        userCircle.setCenter(pos)
        userCircle.setRadius(accuracy)
      }
      // 精度差时不要放大过头，避免"看起来很准"的错觉
      const zoom = accuracy > 800 ? 12.5 : accuracy > 200 ? 14 : 15.5
      map!.setZoomAndCenter(zoom, pos, false, 800)
      if (locateType === 'ip') {
        pushToast(`IP 粗略定位（误差约 ${(accuracy / 1000).toFixed(1)} km），桌面端建议以地图找店为准`)
      } else if (accuracy > 200) {
        pushToast(`定位精度约 ${Math.round(accuracy)} 米，可能与实际位置有偏差`)
      } else {
        pushToast('定位成功，可以按「距我最近」排序了')
      }
      if (infoForId) openInfo(byId.get(infoForId)!)
    } else {
      store.locateStatus = 'error'
      const msg = typeof result?.message === 'string' ? result.message : ''
      pushToast(`定位失败${msg ? `：${msg}` : ''}。请检查浏览器定位权限（页面需为 HTTPS 或 localhost）`)
    }
  })
}

onMounted(async () => {
  try {
    A = await loadAmap()
  } catch {
    pushToast('地图加载失败：请检查 .env 中的 Key、安全密钥和网络')
    return
  }

  map = new A.Map(mapEl.value!, {
    viewMode: '2D',
    mapStyle: MAP_STYLE,
    center: SHANGHAI_CENTER,
    zoom: 11.5,
    zooms: [3, 19],
  })

  infoWindow = new A.InfoWindow({
    isCustom: true,
    offset: new A.Pixel(0, -18),
    autoMove: true,
    closeWhenClickMap: false,
  })
  ;(infoWindow as any).on('close', () => {
    if (infoForId && infoForId === store.selectedId) store.selectedId = null
    infoForId = null
  })

  for (const r of restaurants) {
    const m = new A.Marker({
      position: [r.lng, r.lat],
      content: markerHtml(categoryMap[r.category].color, false),
      anchor: 'center',
      label: { content: r.name, direction: 'bottom', offset: [0, 10] },
      zIndex: 110,
      cursor: 'pointer',
      extData: r.id,
    })
    m.on('click', () => {
      store.selectedId = r.id
    })
    m.setMap(map)
    markers.set(r.id, m)
  }

  map.on('click', () => {
    if (store.selectedId) store.selectedId = null
  })

  // 店名标签密度控制：全市视图（zoom<13.5）隐藏，放大后显示；选中店的标签始终显示
  const syncLabels = () => {
    mapEl.value?.classList.toggle('labels-hidden', map!.getZoom() < 13.5)
  }
  map.on('zoomend', syncLabels)

  // 首开一屏看全：让视野刚好包住所有门店（给左侧面板/底部抽屉留出内边距）
  // 首开只看市中心：视野包住市中心的门店（给左侧面板/底部抽屉留内边距），
  // 远郊门店不撑大初始视野
  const downtownMarkers = restaurants
    .filter((r) => inDowntown(r.lng, r.lat))
    .map((r) => markers.get(r.id))
    .filter((m): m is AMap.Marker => Boolean(m))
  const isMobile = window.innerWidth < 768
  map.setFitView(
    downtownMarkers.length ? downtownMarkers : [...markers.values()],
    false,
    isMobile ? [32, 24, 140, 24] : [48, 48, 48, 446],
    13,
  )
  setTimeout(syncLabels, 800)
  store.mapReady = true
  applyFilter()
})

watch(
  () => store.selectedId,
  (id) => {
    if (!map) return
    refreshMarkerStates()
    if (!id) {
      infoWindow?.close()
      return
    }
    const r = byId.get(id)
    if (!r) return
    map.setZoomAndCenter(Math.max(map.getZoom(), 13), [r.lng, r.lat], false, 600)
    openInfo(r)
  },
)

watch([() => store.activeCategory, () => store.keyword], applyFilter)

watch(
  () => store.locateTick,
  (n) => {
    if (n > 0) locate()
  },
)

onBeforeUnmount(() => {
  map?.destroy()
  map = null
})
</script>

<template>
  <div ref="mapEl" class="map-canvas"></div>
</template>
