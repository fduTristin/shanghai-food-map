<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  PhArrowsDownUp,
  PhCaretDown,
  PhCaretUp,
  PhMagnifyingGlass,
} from '@phosphor-icons/vue'
import { CATEGORIES, categoryMap, restaurants } from '../data/restaurants'
import { displayedRestaurants, store } from '../store'
import { formatDistance } from '../utils'

const isMobile = window.innerWidth < 768
/** 移动端抽屉开关（桌面端始终展开，由 CSS 控制） */
const sheetOpen = ref(!isMobile)

/** 点了列表项：选中并让地图飞过去；移动端顺手收起抽屉看地图 */
function pick(id: string) {
  store.selectedId = id
  if (isMobile) sheetOpen.value = false
}

/** 地图上点了标记时，移动端也收起抽屉 */
watch(
  () => store.selectedId,
  (id) => {
    if (id && isMobile) sheetOpen.value = false
  },
)

function toggleSort() {
  if (!store.userPos) return
  store.sortByDistance = !store.sortByDistance
}
</script>

<template>
  <aside class="panel" :class="{ open: sheetOpen }">
    <header class="panel-head">
      <div class="brand">
        <span class="brand-mark">沪</span>
        <div class="brand-text">
          <h1>沪上食图</h1>
          <p>我的上海美食私藏 · 已收录 {{ restaurants.length }} 家</p>
        </div>
      </div>
      <button
        class="sheet-toggle"
        type="button"
        :aria-label="sheetOpen ? '收起列表' : '展开列表'"
        @click="sheetOpen = !sheetOpen"
      >
        <PhCaretDown v-if="sheetOpen" :size="18" />
        <PhCaretUp v-else :size="18" />
      </button>
    </header>

    <div class="panel-body">
      <label class="search">
        <PhMagnifyingGlass :size="16" class="search-icon" />
        <input
          v-model="store.keyword"
          type="search"
          placeholder="搜店名、招牌菜或标签"
          enterkeyhint="search"
        />
      </label>

      <div class="chips">
        <button
          type="button"
          class="chip"
          :class="{ active: store.activeCategory === null }"
          @click="store.activeCategory = null"
        >
          全部
        </button>
        <button
          v-for="c in CATEGORIES"
          :key="c.key"
          type="button"
          class="chip"
          :class="{ active: store.activeCategory === c.key }"
          @click="
            store.activeCategory = store.activeCategory === c.key ? null : c.key
          "
        >
          <i class="dot" :style="{ background: c.color }"></i>{{ c.label }}
        </button>
      </div>

      <div class="list-meta">
        <span class="count">{{ displayedRestaurants.length }} 家</span>
        <button
          type="button"
          class="sort-btn"
          :class="{ active: store.sortByDistance }"
          :disabled="!store.userPos"
          :title="store.userPos ? '按距离排序' : '先点击右下角定位按钮'"
          @click="toggleSort"
        >
          <PhArrowsDownUp :size="14" />
          距我最近
        </button>
      </div>

      <ul class="store-list">
        <li
          v-for="r in displayedRestaurants"
          :key="r.id"
          class="store-item"
          :class="{ active: r.id === store.selectedId }"
          @click="pick(r.id)"
        >
          <span
            class="cat-dot"
            :style="{ background: categoryMap[r.category].color }"
          ></span>
          <div class="store-main">
            <div class="store-top">
              <strong>{{ r.name }}</strong>
              <span v-if="r.price" class="price">¥{{ r.price }}</span>
            </div>
            <div class="store-sub">{{ r.district }} · {{ r.address }}</div>
            <div v-if="r.mustOrder.length" class="store-must">
              必点：{{ r.mustOrder.join('、') }}
            </div>
            <div class="store-tags">
              <span v-for="t in r.tags" :key="t" class="tag">{{ t }}</span>
              <span v-if="r.distance != null" class="dist"
                >距我 {{ formatDistance(r.distance) }}</span
              >
            </div>
          </div>
        </li>
        <li v-if="displayedRestaurants.length === 0" class="empty">
          没有匹配的门店，换个关键词或分类试试
        </li>
      </ul>
    </div>
  </aside>
</template>
