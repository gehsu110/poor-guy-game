# 角色套裝製作流程交接給 Claude

本文件整理自 `docs/events/qixi-2026.md`，用途是給 Claude 或其他協作者參考「Codex 這次如何製作角色套裝」。  
這不是七夕活動企劃書，而是角色套裝製作流程與踩雷提醒。

## 先讀文件

開始前必讀：

1. `docs/VISUAL_SYSTEM.md`
2. 本文件
3. 需要參考的既有套裝資料夾，例如：
   - `src/assets/academy-art/sakura-set`
   - `src/assets/academy-art/academy-set`
   - `src/assets/academy-art/rainy-detective-set`
   - `src/assets/academy-art/summer-set`

不要只看 `qixi-2026.md` 前半段就照做。  
前半段包含失敗流程與踩雷紀錄，真正可照做的是「動畫重做紀錄」和本文件整理出的正式流程。

## 正式資料夾規則

正式套裝資料夾要乾淨，只保留前端真正引用的正式資產。

七夕最後正式資料夾是：

```text
src/assets/academy-art/qixi-set/
  qixi-bg.webp
  girl-qixi-star-bridge.webp
  boy-qixi-star-bridge.webp
```

不要把這些放進正式資料夾：

- `source/`
- `review/`
- 原始 MP4
- 失敗影片
- 中間 PNG frames
- QuickLook 縮圖
- prompt 暫存檔
- Higgsfield job JSON

如果需要保留過程，放在 `/tmp/...` 或文件紀錄，不要混進正式前端資產路徑。

## 成功流程總覽

正式角色套裝流程：

1. 確認主題與角色規格。
2. 生成背景。
3. 生成女主角完整主圖。
4. 生成男主角完整主圖。
5. 確認角色主圖全身完整、道具完整、腳底完整。
6. 製作純色背景動畫母帶。
7. 用角色主圖做 image-to-video。
8. 用本機抽幀 + 去背，不盲目使用影片去背結果。
9. 組成透明 Animated WebP。
10. 檢查 alpha bbox、幀數、透明度、角色大小。
11. 接入前端。
12. 手機尺寸驗收首頁與造型頁。

## 角色主圖規格

每個角色主圖必須是完整角色，不拆紙娃娃零件。

必須包含：

- 髮型
- 髮色/挑染
- 髮飾
- 表情
- 服裝輪廓
- 鞋子
- 手持物或穿戴道具

必須檢查：

- 全身可見。
- 腳底完整。
- 手持物沒有漂浮。
- 角色仍像同一個主角世界觀。
- 男女版本不是單純換色或換髮。
- 構圖不要太近，不要大頭半身。

七夕女角方向範例：

- 紫色眼睛、Q 版圓臉。
- 側編髮或雙辮。
- 星形髮飾、月白挑染。
- 願望帳本、羽毛筆或星砂瓶。
- 星紗短斗篷、學院祭禮服。

七夕男角方向範例：

- 紫色眼睛、Q 版圓臉。
- 蓬鬆短髮或低馬尾。
- 星圖髮飾或月白挑染。
- 鵲橋票券、小星盤或願望帳本。
- 和女角不同剪影的學院祭外套或短披肩。

## 背景規格

背景是套裝的一部分，不是角色後面的裝飾圖。

背景必須：

- 有近景可踩地面。
- 有中景主題線索。
- 有遠景氣氛。
- 不含角色。
- 不含文字、數字、UI、logo、浮水印。

七夕背景方向：

- 近景：橋面、屋頂平台、石階或祭典平台。
- 中景：願望籤、星燈、帳本祭小攤。
- 遠景：銀河、鵲橋、星線。

背景輸出：

- 建議 9:16 高解析。
- WebP 目標約 `150KB-600KB`。
- 若超過 `1MB`，檢查壓縮品質或裁切。

## 動畫母帶規則

最重要：先取得乾淨的純色背景動畫母帶，再轉透明 Animated WebP。

成功做法：

- 使用角色主圖做 image-to-video。
- 要求固定鏡頭。
- 要求角色全身可見。
- 要求腳底不離地。
- 要求手持物全程存在。
- 使用不撞色純色背景。
- 七夕使用洋紅背景 `#ff00ff`，避免和衣服、票券、星線、薄荷色道具衝突。

不要使用品質不好的去背影片硬轉正式資產。  
七夕第一次失敗就是因為去背影片變黑底，角色道具邊緣破碎，不能當正式動畫。

## 失敗案例提醒

七夕第一次動畫失敗原因：

- 去背影片是黑底，不是乾淨透明母帶。
- 女角帳本、羽毛筆邊緣破碎。
- 男角票券、吊飾、披風邊緣有黑色碎片。
- 部分幀有獨立殘片。
- 不能繼續轉正式 Animated WebP。

正確判斷：

- 不是解析度問題。
- 不是幀率問題。
- 是生成/去背流程與母帶品質問題。

遇到這種狀況要重做母帶，不要硬修到正式資料夾。

## 轉 Animated WebP 流程

七夕最後成功流程是：

1. 用乾淨洋紅背景動畫 MP4。
2. 用 `ffmpeg` 抽 10fps 透明 PNG 幀。
3. 用 `img2webp` 組透明 Animated WebP。
4. 用 `webpmux -info` 檢查動畫資訊。
5. 用 alpha bbox 檢查角色本體大小。

成功命令範例：

```bash
ffmpeg -y -i /tmp/expense-qixi-redo/source/girl-qixi-magenta-motion-v3.mp4 \
  -vf "fps=10,colorkey=0xff00ff:0.33:0.08,format=rgba,scale=360:480:flags=lanczos" \
  /tmp/expense-qixi-redo/frames/girl_v3/f%03d.png

img2webp -lossy -loop 0 -d 100 -q 72 -m 6 \
  /tmp/expense-qixi-redo/frames/girl_v3/f*.png \
  -o /tmp/expense-qixi-redo/output/girl-qixi-star-bridge-q72.webp
```

男角同樣流程：

```bash
ffmpeg -y -i /tmp/expense-qixi-redo/source/boy-qixi-magenta-motion-v3.mp4 \
  -vf "fps=10,colorkey=0xff00ff:0.33:0.08,format=rgba,scale=360:480:flags=lanczos" \
  /tmp/expense-qixi-redo/frames/boy_v3/f%03d.png

img2webp -lossy -loop 0 -d 100 -q 72 -m 6 \
  /tmp/expense-qixi-redo/frames/boy_v3/f*.png \
  -o /tmp/expense-qixi-redo/output/boy-qixi-star-bridge-q72.webp
```

正式輸出目標：

- Canvas: `360 x 480`
- Frames: `40-50`
- Duration: `100ms` per frame
- Loop: forever
- Transparency: yes
- Size target: about `500KB-1.5MB`

## Alpha BBox 檢查

不要只看 canvas 是 `360 x 480`。  
也要檢查角色本體 alpha bbox。

七夕曾經出現：

- Canvas 正確：`360 x 480`
- 但角色本體太小：
  - 女角約 `150 x 308`
  - 男角約 `140 x 296`

這會導致首頁像小模型。

修正後：

- 男女動畫 union bbox 高度都約 `430px`
- 接近既有套裝 `413-445px` 範圍

檢查概念：

```python
from PIL import Image, ImageSequence

im = Image.open("src/assets/academy-art/qixi-set/girl-qixi-star-bridge.webp")
frames = [frame.convert("RGBA") for frame in ImageSequence.Iterator(im)]
union = None
for frame in frames:
    bbox = frame.getchannel("A").getbbox()
    if bbox:
        union = bbox if union is None else (
            min(union[0], bbox[0]),
            min(union[1], bbox[1]),
            max(union[2], bbox[2]),
            max(union[3], bbox[3]),
        )
print(union, (union[2] - union[0], union[3] - union[1]))
```

## 前端接入位置

新增套裝通常改這幾個地方：

- `src/outfitAssets.js`
- `src/screens/ProfileScreen.jsx`
- `src/screens/TownScreen.jsx`
- `src/theme.css`
- 活動任務時再加 `src/events/...` 與 `MissionScreen.jsx`

七夕接入方式：

- outfit id: `qixi_star_bridge`
- set id: `qixi_star_bridge_set`
- bgTheme: `qixi`
- 背景: `qixi-bg.webp`
- 女角: `girl-qixi-star-bridge.webp`
- 男角: `boy-qixi-star-bridge.webp`

## 首頁尺寸與落點

每套要獨立設定：

- `top`
- `width`
- `max-width`
- `shadow`
- 背景裁切

不能共用同一組角色尺寸。

驗收標準：

- 角色腳底踩在背景地面或魔法圈上。
- 下方 HUD 不遮腳。
- 頭頂不貼 HUD。
- 手持物最大動作不出界。
- 手機和桌機都要看。

## 給 Claude 的重點提醒

請 Claude 注意：

1. 不要把 `qixi-2026.md` 裡的失敗流程當成正式流程。
2. 不要把黑底去背 MP4 當正式資產。
3. 不要把 `source/`、`review/`、frames 放進正式套裝資料夾。
4. 不要只看 `360 x 480`，要檢查 alpha bbox。
5. 不要把角色越縮越小來適應背景，要修正角色本體大小和首頁落點。
6. 不要把節日完整套裝放普通商店。
7. 不要改首頁 HUD / dock 版位，除非 `VISUAL_SYSTEM.md` 已經更新規則。
8. 角色必須和背景互相解釋，不能只是貼在背景上。
9. 手持物必須全程存在，動畫中不能消失或碎裂。
10. 正式完成後一定要跑：

```bash
npm run lint
npm run build
```

## 七夕最後狀態

七夕最後可視為合格參考：

- 正式資料夾乾淨。
- 男女都是透明 Animated WebP。
- 背景是壓縮 WebP。
- 前端已接入 `qixi_star_bridge`。
- 活動任務線已支援收藏獎勵。
- dev 環境可暫時解鎖查看。

目前仍可後續精修：

- 首頁展示舞台式 HUD。
- 每套角色腳底落點。
- 商店與活動套裝取得規則。
