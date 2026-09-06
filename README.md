# 窮鬼勇者

直式手機優先的記帳冒險遊戲。記帳會轉換成攻擊與每日怪物進度。

## 本機開發

```bash
npm ci
npm run dev
```

## GitHub → Cloudflare Pages

- Production branch：`main`
- Build command：`npm run build`
- Build output：`build`
- Node.js：建議 22

`public/_redirects` 提供 SPA fallback；`public/_headers` 負責安全標頭及帶 hash 靜態資產快取。PWA 會提示新版可用，記帳時不強制接管或重載。應用程式先快取核心畫面，其他收藏資產依使用情況快取。

複製 `.env.example` 為 `.env` 並填入 Firebase 專案設定。缺少設定時使用持久本機存檔；開發環境可用 `?local=1` 測試本機模式。設定頁可匯出帳本、造型和遊戲進度的 JSON 備份。Google 綁定與 Firestore 權限需要在對應 Firebase 專案啟用。

每次 push 前執行：

```bash
npm run check
```

視覺規格位於 [`docs/VISUAL_SYSTEM.md`](docs/VISUAL_SYSTEM.md)。

本次改版盤點與驗證範圍：[收藏冒險改版紀錄](docs/collection-overhaul.md)。美術母版、動作來源和轉檔規則：[薄荷帳本素材紀錄](docs/storybook-art-production.md)。

下一輪玩法、自由換裝、導覽與底層重整：[全面改版盤點與提案（2026-09-06）](docs/game-redesign-audit-2026-09-06.md)。此文件區分目前已完成的能力與尚未實作的建議。
