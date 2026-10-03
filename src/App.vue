<script setup lang="ts">
import { PhCircleNotch, PhCrosshair } from '@phosphor-icons/vue'
import MapView from './components/MapView.vue'
import SidePanel from './components/SidePanel.vue'
import { isAmapConfigured } from './config'
import { requestLocate, store } from './store'

function onLocate() {
  if (store.locateStatus === 'locating') return
  requestLocate()
}
</script>

<template>
  <div class="app">
    <template v-if="isAmapConfigured">
      <MapView />
      <SidePanel />

      <button
        class="locate-fab"
        :class="`is-${store.locateStatus}`"
        type="button"
        title="定位到我的位置"
        aria-label="定位到我的位置"
        :disabled="store.locateStatus === 'locating'"
        @click="onLocate"
      >
        <PhCircleNotch
          v-if="store.locateStatus === 'locating'"
          :size="22"
          class="spin"
        />
        <PhCrosshair v-else :size="22" />
      </button>

      <Transition name="toast">
        <div v-if="store.toast" :key="store.toastTick" class="toast">
          {{ store.toast }}
        </div>
      </Transition>
    </template>

    <div v-else class="setup-screen">
      <div class="setup-card">
        <span class="brand-mark">沪</span>
        <h1>还差一步：配置高德 Key</h1>
        <ol>
          <li>
            打开
            <a href="https://console.amap.com/dev/key/app" target="_blank" rel="noopener"
              >高德开放平台控制台</a
            >，创建应用并添加 Key，服务平台选择「Web端(JS API)」
          </li>
          <li>
            在项目根目录的 <code>.env</code> 中填入
            <code>VITE_AMAP_KEY</code> 和
            <code>VITE_AMAP_SECURITY_CODE</code>（安全密钥）
          </li>
          <li>重启 <code>npm run dev</code> 即可</li>
        </ol>
        <p class="setup-hint">本地开发使用 localhost 无需 HTTPS；部署到线上时请使用 HTTPS 才能定位。</p>
      </div>
    </div>
  </div>
</template>
