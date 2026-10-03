import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // host: true → 同时监听局域网 IP，手机与电脑连同一 WiFi 即可访问
  server: { host: true },
  preview: { host: true },
})
