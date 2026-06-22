# 窮鬼勇者 (expense-quest) — CLAUDE.md

## 專案概述

React + Vite PWA 記帳 RPG。核心設計：記帳 = 戰鬥、服裝 = 場景替換。
每套服裝有獨立角色動畫（idle loop），用 SpriteCharacter 組件播放。

---

## 設計系統（Design System）

### 視窗規格
- **目標裝置**：手機直式，390px 寬（iPhone 14 Pro 基準）
- **遊戲容器**：最大寬 480px，置中
- **安全區**：底部留 safe-area-inset-bottom

### 色彩
| 用途 | 顏色 |
|------|------|
| 主色 紫 | `#7b63d8` |
| 輔色 青 | `#52ded4` |
| 外框背景 | `#e8e0f7` (淡薰衣草) |
| 面板白 | `rgba(255,255,255,0.92)` |
| 文字深 | `#26324a` |
| 文字淡 | `#9d94b5` |
| 危險/攻擊 | `#FF6D98` |
| 成功/回復 | `#24B7B0` |

### 字體
- 標題/數字：font-weight 900
- 標籤：font-weight 900，10px
- 內文：font-weight 600

### 視覺風格
**全遊戲圖示統一採用 Nintendo Pikmin Bloom 3D 風格**：
- 圓潤、飽滿、3D 軟渲染
- 顏色鮮豔友善
- 透明背景（去背 PNG）
- 不使用線條/平面圖示（SVG 只保留記帳分類直到全部重畫完畢）

---

## 素材規格總表（Asset Spec）

| 素材類別 | 用途 | 生成尺寸 | 顯示尺寸 | 格式 | 背景 |
|---------|------|---------|---------|------|------|
| Tab 圖示 | 底部導覽列 | 512×512 | **44×44px** | PNG | **透明** |
| 貨幣圖示 | 玩家資產顯示 | 256×256 | **22×22px** | PNG | **透明** |
| 分類圖示 | 記帳分類選擇 | 256×256 | **28×28px** | PNG | **透明** |
| 地圖節點圖示 | 地圖每日節點 | 256×256 | **30×30px** | PNG | **透明** |
| 服裝縮圖 | 商店/抽卡展示 | 400×400 | 120×120px | PNG | 白底 OK |
| 角色動畫幀 | 主城角色 | 350×656 | 54vw max-width 210px | PNG RGBA | **透明** |

---

## 資料夾結構

```
src/assets/
├── icons/
│   ├── tab/          ← Tab 導覽列圖示（44px，透明 PNG）
│   │   ├── tab-today.png
│   │   ├── tab-map.png
│   │   ├── tab-quest.png
│   │   ├── tab-supply.png
│   │   └── tab-guild.png
│   ├── currency/     ← 貨幣/票券圖示（22px，透明 PNG）
│   │   ├── coin-gold.png
│   │   ├── coin-purple.png
│   │   ├── ticket-normal.png
│   │   └── ticket-gold.png
│   ├── category/     ← 記帳分類圖示（28px，透明 PNG）
│   │   ├── cat-food.png
│   │   ├── cat-transport.png
│   │   ├── cat-shopping.png
│   │   ├── cat-play.png
│   │   ├── cat-health.png
│   │   ├── cat-daily.png
│   │   ├── cat-learn.png
│   │   └── cat-other.png
│   └── map/          ← 地圖節點圖示（30px，透明 PNG）
│       ├── map-unknown.png
│       ├── map-today.png
│       ├── map-done.png
│       ├── map-boss.png
│       └── map-retro.png
│
├── academy-art/generated/
│   ├── frames/       ← 角色動畫幀（現有路徑，勿更改，outfitAssets.js 依賴）
│   │   ├── girl-academy/     f01-f12.png ✓
│   │   ├── girl-crystal-gown/ f01-f12.png ✓  (= pink_robe)
│   │   ├── girl-starcloak/   f01-f12.png ✓  (= night_cape)
│   │   ├── girl-suit/        f01-f12.png（需重生成，比例不對）
│   │   ├── boy-crystal-gown/ f01-f12.png ✓
│   │   ├── boy-starcloak/    f01-f12.png ✓
│   │   ├── boy-suit/         f01-f12.png（需重生成）
│   │   └── boy-academy/      （待生成）
│   ├── outfits/      ← 服裝靜態縮圖
│   └── videos/       ← 去背透明影片（Source only，不打包進 build）
```

> ⚠️ `frames/` 路徑不要動，所有 import 路徑在 `outfitAssets.js` 裡，改了會爆。

---

## Tab Bar 規格

**設計**：浮動式底欄，不固定在頁面流（position: fixed），有 backdrop-blur 玻璃感

```
高度：72px + safe-area-inset-bottom
圖示顯示：44×44px
圖示底部 border-radius：8px（輕微圓角）
文字標籤：10px，font-weight 900
圖示與標籤間距：4px
```

**Active 狀態**：
- 圖示：scale(1.08) + drop-shadow(紫色光暈)
- 文字：顏色 #7b63d8（變深）
- 底部指示條：3px 高，20px 寬，紫→青漸層圓角

**Inactive 狀態**：
- 圖示：opacity 0.45 + 去飽和 saturate(0.5)
- 文字：#9d94b5

---

## 圖示生成規格

### Master Prompt 模板
```
"[物件描述], cute 3D rendered game icon, soft rounded plump shape, 
gentle drop shadow, transparent background, bright friendly colors, 
Nintendo Pikmin Bloom style, polished mobile game UI asset, 
centered, single object only, [色調] color scheme, no text, no outline"
```

**Model**：`nano_banana_pro`，aspect_ratio: `1:1`

### 去背 Pipeline
```
1. generate_image（nano_banana_pro，白底或透明）
2. remove_background（image mode）→ 透明 PNG
3. 使用者下載，存到對應的 icons/ 子目錄
4. GameIcon.jsx 改為 local import（非 CDN URL）
```

> ⚠️ Higgsfield CDN 從 server side 被擋（圖片和影片都一樣），必須使用者瀏覽器下載。

### 現有圖示（待去背）
| icon name     | 用途          | Higgsfield job ID | 去背狀態 |
|---------------|---------------|-------------------|----------|
| tab-today     | 今日 tab（太陽）| 17165c82         | ❌ 待去背 |
| tab-map       | 地圖 tab（捲軸）| 9bfe8b29         | ❌ 待去背 |
| tab-quest     | 任務 tab（劍） | 5d1debb4          | ❌ 待去背 |
| tab-supply    | 補給 tab（箱） | 7de8cc9c          | ❌ 待去背 |
| tab-guild     | 公會 tab（盾） | ea3a4703          | ❌ 待去背 |
| coin-gold     | 黃星幣         | e2e88447          | ❌ 待去背 |
| coin-purple   | 紫星幣         | 458dd6cd          | ❌ 待去背 |
| ticket-normal | 普通扭蛋票     | 6e1a5658          | ❌ 待去背 |
| ticket-gold   | 金扭蛋票       | 319f8d9f          | ❌ 待去背 |

### 待生成圖示
**分類圖示（8 個）**：food、transport、shopping、play、health、daily、learn、other
**地圖節點（5 個）**：unknown、today（星）、done（勾）、boss（骷髏）、retro（↺）

---

## 角色幀正規化規格

- **Canvas**：350 × 656 px，RGBA 透明背景
- **目標角色高度**：556px（85% fill）
- **寬度限制**（斗篷等展開型）：MAX_CHAR_W = 310px
- **scale 公式**：`scale = min(TARGET_CHAR_H / max_h, MAX_CHAR_W / max_w)`
- **底部 y**：587（腳底對齊）
- **幀數**：12 幀（f01–f12），從影片均勻取樣
- **播放**：4 fps，ping-pong 循環（SpriteCharacter 內建）

---

## 角色動畫製作 Pipeline

```
1. 設計參考圖（nano_banana_pro，白底，chibi 全身，3:4）
2. Kling 3.0 生成動畫影片（綠底 #00FF00，16:9，5s，start_image）
3. Higgsfield remove_background（video 模式）→ 透明影片
4. 使用者將透明影片下載存到 videos/ 資料夾
5. ffmpeg 拆幀 4fps → /tmp/raw/
6. Python PIL 黑底→透明 + 正規化 → frames/{outfit}/f01-f12.png
```

### 正規化腳本（bash 路徑版）
```bash
OUTFIT="girl-starcloak"
VIDEO_PATH="/sessions/gracious-intelligent-johnson/mnt/嗎膩/expense-quest/src/assets/academy-art/generated/videos/${OUTFIT}-transparent.mp4"
mkdir -p /tmp/${OUTFIT}_raw
ffmpeg -i "$VIDEO_PATH" -vf fps=4 /tmp/${OUTFIT}_raw/raw_%03d.png -y -loglevel error
python3 /sessions/gracious-intelligent-johnson/mnt/outputs/expense-quest-outfit-skill/scripts/normalize_frames.py \
  --raw /tmp/${OUTFIT}_raw \
  --out /sessions/gracious-intelligent-johnson/mnt/嗎膩/expense-quest/src/assets/academy-art/generated/frames/${OUTFIT}
```

---

## 服裝清單

**設計原則**：每套服裝必須有獨特髮型/髮色/臉部造型，才有收集意義。

| outfitId    | 資料夾名稱      | 名稱         | 女生設計                         | 男生設計                   | 狀態 |
|-------------|----------------|--------------|----------------------------------|----------------------------|------|
| academy     | academy        | 星術學院套裝 | 預設褐髮                         | 預設褐髮                   | 女✓ 男❌ |
| pink_robe   | crystal-gown   | 粉晶禮服套裝 | 粉色長髮、禮服                   | 粉色短髮、禮服             | ✓✓ |
| night_cape  | starcloak      | 星夜斗篷套裝 | 銀白漸層紫長髮、大斗篷           | 午夜深藍髮、月亮臉紋       | ✓✓ |
| suit        | suit           | 都市精英套裝 | 需重生成（成人比例）             | 需重生成                   | 有但❌ |
| saving_hero | —              | 省錢勇者     | 未生成                           | 未生成                     | ❌ |
| mint_coat   | —              | 薄荷補給     | 未生成                           | 未生成                     | ❌ |
| moonlight   | —              | 月光限定     | 未生成                           | 未生成                     | ❌ |

---

## 角色 CSS
```css
.academy-screen-character {
  position: absolute;
  z-index: 20;
  left: 50%;
  transform: translateX(-50%);
  top: 80px;
  width: 54vw;
  max-width: 210px;
  height: auto;
  filter: drop-shadow(0 18px 18px rgba(78, 61, 122, 0.22));
  pointer-events: none;
}
```
> `width: auto` 會取 intrinsic 350px 被 overflow:hidden 裁切，必須用 vw 固定。

---

## GameIcon 組件

`src/components/GameIcon.jsx`

- `IMAGE_ICONS` 物件：icon name → 圖片路徑（CDN URL 或 local import）
- 有 IMAGE_ICONS 條目的 → 渲染 `<img className="game-icon--img">`
- 無條目的 → 渲染 SVG（保留給記帳分類圖示，待全部替換）
- CSS `.game-icon--img`：`object-fit: contain`，無 mix-blend-mode（已去背，透明 PNG 不需要）

---

## 待辦清單

### Phase 1（規格） ✅
- [x] 制定完整設計規格到 CLAUDE.md

### Phase 2（圖示去背 + 補齊）
- [x] 9 個現有圖示用 Higgsfield remove_background 去白底
- [x] 下載到 `src/assets/icons/` 對應子目錄，改 GameIcon.jsx 為 local import
- [ ] 生成 8 個分類圖示（cat-food / cat-transport / cat-shopping / cat-play / cat-health / cat-daily / cat-learn / cat-other）
- [ ] 生成 5 個地圖節點圖示

### Phase 3（Tab Bar 重設計）
- [ ] 拆掉舊 `academy-dock` CSS 框架
- [ ] 實作浮動式底欄（72px，backdrop-blur，44px 圖示）
- [ ] Active/inactive 狀態動畫

### Phase 4（角色補齊）
- [ ] suit 重新生成 chibi 比例（女+男）
- [ ] academy 男生幀生成
- [ ] 確認後將 pink_robe / night_cape / suit 的 `owned` 改回 `false`

### Phase 5（清理）
- [ ] 移除 `src/assets/icons/download-icons.html`（暫時工具）
- [ ] 移除 GameIcon.jsx 裡的 CDN URL，全部改為 local import
- [ ] 整理舊有未使用素材
