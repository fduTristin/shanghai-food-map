# 沪上食图 · 上海美食地图

个人使用的上海美食地图。Vue 3 + Vite + TypeScript，高德地图 JS API，纯前端静态数据，无后端。

## 首次使用：配置高德 Key（必填）

1. 打开 [高德开放平台控制台](https://console.amap.com/dev/key/app)，创建应用并添加 Key，服务平台选择 **「Web端(JS API)」**，同时会得到一个**安全密钥（securityJsCode）**。
2. 复制 `.env.example` 为 `.env`，填入：
   ```
   VITE_AMAP_KEY=你的KEY
   VITE_AMAP_SECURITY_CODE=你的安全密钥
   ```
3. 重启 `npm run dev`。

> `.env` 已被 git 忽略，不会提交。未配置时打开网站会看到引导提示。

## 常用命令

```bash
npm run dev      # 本地开发（默认 http://localhost:5173）
npm run build    # 类型检查 + 生产构建
npm run preview  # 预览构建产物
```

## 添加 / 修改门店

全部数据在 **`src/data/restaurants.ts`**，往数组里加一条即可，改完保存自动生效：

```ts
{
  id: 'xxx',               // 唯一 id
  name: '店名',
  category: 'benbang',     // 分类，见同文件 CATEGORIES
  lng: 121.47, lat: 31.23, // GCJ-02 坐标（高德坐标系）
  district: '黄浦',
  address: 'xx路 xx 号',
  price: 50,               // 人均
  tags: ['标签'],
  note: '一句话收录理由',
  mustOrder: ['招牌菜1', '招牌菜2'],
}
```

**坐标拾取**：用官方工具 [高德坐标拾取器](https://lbs.amap.com/tools/picker)，搜索店名后点击地图即可复制精确坐标（必须是 GCJ-02 坐标，不要用 GPS 原始坐标）。

## 功能

- 打开即见上海市中心（首开视野只包市中心门店，远郊门店不撑大视野；范围见 `src/config.ts` 的 `DOWNTOWN_BOUNDS`）
- 门店按分类着色标记 + 店名标签，点击弹详情卡（必点菜、人均、导航直达链接）
- 左侧门店列表：分类筛选 / 关键词搜索 / 按距我排序
- 右下角按钮获取我的当前位置（蓝点 + 精度圈），列表显示「距我 xx km」
- 移动端为底部抽屉布局

## 部署到 GitHub Pages

认证流程（一次配置，之后 push 即自动部署）：

1. 仓库 → **Settings → Secrets and variables → Actions → New repository secret**，添加两个 secret：
   - `VITE_AMAP_KEY`（你的高德 Key）
   - `VITE_AMAP_SECURITY_CODE`（对应的安全密钥）
2. 仓库 → **Settings → Pages → Source** 选 **GitHub Actions**。
3. 高德开放平台控制台 → 该 Key 的**域名白名单**里加上 `<用户名>.github.io`，以及本地开发用的 `localhost`、`127.0.0.1`（局域网 IP 访问的 referer 是 IP，加了白名单后手机局域网访问可能失效，两个方案二选一：白名单内加当时的局域网 IP，或自用阶段先不设白名单、仅部署版启用）。
4. push 到 `main` 分支即触发构建部署。站点地址：
   - 项目页：`https://<用户名>.github.io/<仓库名>/`
   - 用户主页（仓库名为 `<用户名>.github.io`）：`https://<用户名>.github.io/`
   - 工作流已自动区分两种 base 路径，无需改配置。

注意：

- Vite 的环境变量在**构建期**内联进 JS 产物，Key 对访客可见——这是所有浏览器端地图 Key 的通用做法，请务必在高德控制台为该 Key 配置**域名白名单**。
- GitHub Pages 在大陆访问不稳定，如果自用频率高可考虑 Cloudflare Pages / 腾讯 EdgeOne Pages。

## 备注

- 浏览器定位要求页面运行在 **HTTPS 或 localhost** 下，并授予定位权限。
- 定位能力由高德 `AMap.Geolocation` 插件提供，坐标已自动转为 GCJ-02。
- 定位分两种：手机端一般是 GPS/WiFi 精确定位；**桌面端常见 IP 粗定位兜底**，可能被吸附到 IP 库里的附近锚点（如学校、商圈），偏差可达数公里——此时页面会提示「IP 粗略定位」。想禁用粗定位兜底，在 `src/components/MapView.vue` 的 Geolocation 配置里加 `noIpLocate: true`（定位失败会改为报错提示）。
