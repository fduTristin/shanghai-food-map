import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // 部署到 GitHub Pages 项目页时需要 /<仓库名>/ 前缀（由 Actions 工作流注入 BASE_PATH）
  base: process.env.BASE_PATH ?? '/',
  // host: true → 同时监听局域网 IP，手机与电脑连同一 WiFi 即可访问
  server: { host: true },
  preview: { host: true },
})
