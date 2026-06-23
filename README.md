# 窮鬼勇者

直式手機優先的記帳冒險遊戲。記帳會轉換成攻擊與每日怪物進度。

## 本機開發

```bash
npm install
npm run dev
```

## GitHub → Cloudflare Pages

- Production branch：`main`
- Build command：`npm run build`
- Build output：`build`
- Node.js：建議 22

`public/_redirects` 提供 SPA fallback；`public/_headers` 負責安全標頭及帶 hash 靜態資產快取。PWA 使用 auto-update，部署新版後會清除過期快取並接管現有頁面。

每次 push 前執行：

```bash
npm run lint
npm run build
```

視覺規格位於 [`docs/VISUAL_SYSTEM.md`](docs/VISUAL_SYSTEM.md)。
