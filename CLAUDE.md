# 窮鬼勇者 (expense-quest) — CLAUDE.md

## 專案概述

React + Vite PWA 記帳 RPG。核心設計：記帳 = 戰鬥、服裝 = 場景替換。
每套服裝有獨立角色動畫（idle loop），用 SpriteCharacter 組件播放。

---

## 關鍵路徑

```
expense-quest/src/
├── assets/academy-art/generated/
│   ├── frames/{outfit}/f01.png … f12.png   ← 正規化後的角色幀（350×656 RGBA）
│   ├── videos/{outfit}-transparent.mp4      ← Higgsfield 去背透明影片（存放此處）
│   └── outfits/{outfit}.png                 ← 靜態縮圖（商店用）
├── outfitAssets.js    ← 所有服裝資產對應表（新增服裝改這裡）
├── components/
│   ├── SpriteCharacter.jsx   ← 多幀 idle 動畫（ping-pong 無縫循環）
│   └── ChromaKeyCanvas.jsx   ← 綠幕影片即時去背
└── screens/
    └── TownScreen.jsx        ← 主城畫面，角色顯示邏輯在此
```

---

## 服裝清單

| outfitId    | 名稱         | 女生角色設計                     | 男生角色設計               | 幀狀態 |
|-------------|--------------|----------------------------------|----------------------------|--------|
| academy     | 星術學院套裝 | 預設造型（褐髮）                 | 預設造型（褐髮）           | 女✓ 男待補 |
| pink_robe   | 粉晶禮服套裝 | 粉色長髮、禮服                   | 粉色短髮、禮服             | ✓✓ |
| night_cape  | 星夜斗篷套裝 | 銀白漸層紫長髮、大斗篷           | 午夜深藍髮、月亮臉紋、斗篷 | ✓✓ |
| suit        | 都市精英套裝 | （待重新生成，比例問題）         | （待重新生成）             | 有幀但需更新 |
| saving_hero | 省錢勇者     | （未生成）                       | （未生成）                 | 無 |
| mint_coat   | 薄荷補給     | （未生成）                       | （未生成）                 | 無 |
| moonlight   | 月光限定     | （未生成）                       | （未生成）                 | 無 |

**設計原則**：每套服裝必須換不同髮型/髮色/臉部造型，才有收集意義。

---

## 角色幀正規化規格

- Canvas：350 × 656 px，RGBA
- 目標角色高度：556px（85% fill）；若斗篷等寬服裝超出 canvas 寬，改以寬度限制（MAX_CHAR_W = 310px）
- 底部 y：587（角色腳底對齊）
- 幀數：12 幀（f01–f12），從影片均勻取樣
- 播放速度：4 fps，ping-pong 循環（SpriteCharacter 內建）

---

## 角色動畫製作 Pipeline

```
1. 設計參考圖（nano_banana_pro，白底，chibi 全身）
2. Kling 3.0 生成動畫影片（綠底 #00FF00，16:9，5s，start_image）
3. Higgsfield remove_background（video 模式）→ 透明影片
4. 使用者將透明影片存到 videos/ 資料夾（CDN server-side 被擋，必須本機操作）
5. ffmpeg 拆幀 4fps → /tmp/raw/
6. Python PIL 黑底→透明 + 正規化 → frames/{outfit}/f01-f12.png
```

> ⚠️ Higgsfield CDN (d8j0ntlcm91z4.cloudfront.net) 從 server 端存取會被 proxy 擋 403。
> 透明影片必須由使用者瀏覽器下載，存至 `videos/` 資料夾後才能處理。

---

## 角色 CSS（index.css）

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

> `width: auto` 會取 intrinsic 350px 被 overflow:hidden 裁切，必須用 `width: vw` 固定。

---

## 正規化 Python 腳本（可直接在 bash 執行）

```python
from PIL import Image
import numpy as np, os

TARGET_CHAR_H = 556
TARGET_BOTTOM_Y = 587
CANVAS_W, CANVAS_H = 350, 656
BLACK_THRESH = 30
MAX_CHAR_W = 310

def black_to_transparent(img_rgb):
    arr = np.array(img_rgb)
    rgba = np.zeros((*arr.shape[:2], 4), dtype=np.uint8)
    rgba[:,:,:3] = arr
    is_black = (arr[:,:,0]<BLACK_THRESH)&(arr[:,:,1]<BLACK_THRESH)&(arr[:,:,2]<BLACK_THRESH)
    rgba[:,:,3] = np.where(is_black, 0, 255)
    return Image.fromarray(rgba, 'RGBA')

def normalize_frames(raw_dir, out_dir):
    frames = sorted([f for f in os.listdir(raw_dir) if f.endswith('.png')])
    transparent = [black_to_transparent(Image.open(os.path.join(raw_dir,f)).convert('RGB')) for f in frames]
    max_h = max(rgba.getbbox()[3]-rgba.getbbox()[1] for rgba in transparent if rgba.getbbox())
    max_w = max(rgba.getbbox()[2]-rgba.getbbox()[0] for rgba in transparent if rgba.getbbox())
    scale = min(TARGET_CHAR_H/max_h, MAX_CHAR_W/max_w)
    new_w, new_h = int(max_w*scale), int(max_h*scale)
    total = len(transparent)
    indices = [round(i*(total-1)/11) for i in range(12)]
    os.makedirs(out_dir, exist_ok=True)
    for i, idx in enumerate(indices):
        rgba = transparent[idx]
        bbox = rgba.getbbox()
        resized = rgba.crop(bbox).resize((new_w,new_h), Image.LANCZOS) if bbox else rgba
        canvas = Image.new('RGBA',(CANVAS_W,CANVAS_H),(0,0,0,0))
        canvas.paste(resized,((CANVAS_W-new_w)//2, TARGET_BOTTOM_Y-new_h), resized)
        canvas.save(os.path.join(out_dir,f'f{i+1:02d}.png'))
```

---

## 待辦

- [ ] suit（都市精英）：需重新生成 chibi 比例影片，現版本是成人動漫比例
- [ ] academy 男生幀：尚未生成，`boyFrames: null`
- [ ] saving_hero / mint_coat / moonlight：角色設計＋影片全部待做
- [ ] 服裝解鎖測試完畢後，將 pink_robe / night_cape / suit 的 `owned` 改回 `false`
