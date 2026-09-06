# Wind Atelier：RE:BIRTH 參考方向的第一個實機切片

> 2026-09-06 後續修正：人物畫風已獲認可；舊配件定位與全身生成待機已由 [男女與髮型配戴修正](./wind-atelier-rig-production.md) 取代。下方為第一輪製作紀錄。

日期：2026-09-06。使用者指定 RE:BIRTH 並要求直接嘗試、避免傳統表格式 UX/UI。

## 已接入的畫面

首頁改為星風露台：角色站在場景中，章節冒險、換裝和相遇圖鑑在邊緣，今日手帳與具名記帳入口可見。造型間改為人物舞台、部位選擇、可滑動收藏和穿上操作。手機使用右側部位列及底部收藏；寬畫面使用人物與收藏並排。價格、差額、已擁有狀態、心願、旅程印記及經典收藏入口都保留。

衣裝目前是兩套完整造型；帽飾、腰間手帳／旅行包、夥伴各自獨立。切換帽飾不再清除尚未購買衣裝的試穿；含未取得物品的搭配提供「查看待兌換」，存檔仍使用原本所有權與購買驗證，不會偷偷裝備未買到的東西。

這是 **2D 分層角色**，不是 3D 模型。近看模式提供高解析度放大，沒有假旋轉操作。待機為固定首尾畫面生成的眨眼、輕呼吸與斗篷微風片段；配件以同一原始畫布定位疊合。此法適用目前的小幅待機，尚無行走、揮手、戰鬥骨架與大幅轉身的配件追蹤。完整大動作仍需後續製作。

## 美術與效能

原創栗髮、青眼旅人與深靛／薄荷衣装採清楚的動漫線條、明暗色塊；場景為明亮的海風露台。參考 [RE:BIRTH 官方角色呈現](https://sena.netmarble.com/en) 的辨識度，沒有使用該遊戲的人物、UI 或素材。生成結果保留了較修長的比例，並未將提示詞中的 4.5 頭身當成實際交付宣稱。

- [完整構圖概念稿](./concepts/wind-atelier-screen-v1.png) 由內建 imagegen 產生，只是設計參考，不是實機截圖。
- 正式人物、衣裝、道具、夥伴、場景與動態均由 Higgsfield CLI 製作，提示詞完整收在 [prompt set](./wind-atelier-prompts.json)。
- 最終資產位於 `src/assets/academy-art/wind-atelier/`，沒有引用 Codex 暫存圖片路徑。WebP 靜態圖及縮圖約 680 KB；全部圖像與影片合計約 3.6 MB。主畫面不再引用先前的 glTF 與 Three.js 人物引擎。
- 角色影片為 540 × 960、24 fps、約 4 秒的 VP9 alpha WebM。場景為 720 × 1280 H.264。畫面看不見或分頁隱藏時停止播放，開記帳面板時停用新場景的背景與人物影片。
- 新的靜態人物、配件、夥伴與場景加入 PWA 預快取；大型動態片段不強迫在安裝時下載。靜態圖在影片可播放前顯示。播放透明影片前檢查實際解碼 alpha；解碼器丟棄透明通道時維持靜態圖，避免黑色方塊。減少動態、省流量與近距離細節也使用靜態圖。瀏覽器實測為 Codex Chromium，未宣稱已在 Safari 真機驗收。

## 製作來源

概念稿：內建 imagegen，檔名 `exec-d5eba8a2-d2a1-41d1-9dc0-0927a211e614.png`。

| 素材／步驟 | Higgsfield 模型 | 工作 ID |
| --- | --- | --- |
| hero | `nano_banana_2` | `aba74592-892f-4281-82a8-be607dad7936` |
| background | `nano_banana_2` | `41ef335b-ec1b-40e2-b20f-047235d5e418` |
| hero-alpha | `image_background_remover` | `a4a781ef-6e68-45d5-8bfd-9b1c9f1519f0` |
| night | `nano_banana_2` | `672b0f23-238e-4477-b282-7d626231bb61` |
| night-alpha | `image_background_remover` | `ddd094d5-b4f3-427a-a8b6-091a7ee0269f` |
| accessories | `nano_banana_2` | `0241d0b5-b243-472f-b404-8377423a0d5c` |
| accessories-alpha | `image_background_remover` | `da3f53cc-10d7-4ad5-80b4-ca8d1c0cbf2c` |
| companions | `nano_banana_2` | `269600b9-3ae6-4147-ab27-507158c3cbcb` |
| companions-alpha | `image_background_remover` | `f0448161-fb70-4fd3-9ffc-aba378112ba4` |
| terrace-loop | `seedance1_5` | `456e8569-0054-4006-972d-9ec984694dbb` |
| mint-idle | `seedance1_5` | `d592376c-f964-43ab-9648-b3886cd3bb59` |
| night-idle | `seedance1_5` | `7e980996-945e-46bf-8159-ec6cb82a707b` |
| mint-idle-matte | `video_background_remover` | `98b41770-8088-4c49-befe-172738bd9f03` |
| night-idle-matte | `video_background_remover` | `af465082-80a4-496b-a28e-902561796bf2` |

影片使用 `--start-image` 與 `--end-image` 指向同一母版、`--aspect_ratio 9:16`、4 秒、1080p；普通 `--image` 的參考模式試作會重畫人物與鏡頭，已淘汰，不在成品引用中。兩套人物原圖共用 1696 × 2528 畫布；背景去除後以 cwebp 包裝、壓縮，道具與夥伴以透明區域邊界切出各自資產。

影片背景去除服務輸出黑底 H.264，不能直接當作 alpha 影片。以原始白底片段與服務黑底片段的差值取得透明遮罩，對外部白區與髮絲邊界清理，再由 FFmpeg 輸出 WebM。以下為最終 FFmpeg filter graph（每套各自使用來源及對應去背結果，輸出 libvpx-vp9、CRF 26、auto-alt-ref 0）：

```text
[0:v]format=gbrp,split=3[src][white][hair];[white]format=gray,lut=y='if(gt(val,235),255,0)',floodfill=x=0:y=0:s0=255:d0=128,lut=y='if(eq(val,128),0,255)'[outside];[hair]format=gray,geq=lum='if(lt(Y,H*0.20)*gt(lum(X,Y),229)*(lt(X,W*0.42)+gt(X,W*0.64)+lt(Y,H*0.103)),0,255)'[hairclean];[1:v]format=gbrp,split[matte][color];[src][matte]blend=all_mode=subtract,negate,format=gray,lut=y='if(lt(val,24),0,if(gt(val,230),255,(val-24)*255/206))'[derived];[derived][outside]blend=all_mode=darken[mask0];[mask0][hairclean]blend=all_mode=darken[mask];[color][mask]alphamerge,scale=540:960:flags=lanczos,format=yuva420p[out]
```

## 驗證紀錄

- `npm run check`：ESLint、56 項既有領域／存檔測試、Vite/PWA build 通過。
- 637 × 784 原視窗、390 × 844、390 × 640 的完整畫面檢查；窄螢幕沒有水平溢位，收藏欄與底部導覽沒有覆蓋。
- 兩套衣裝、帽飾混搭、取下隨身物、放大／近看、對話回饋、未持有衣裝價格與差額、記帳面板開啟／關閉皆經實際瀏覽器操作。
- 本機試穿青葉緞帶與空隨身物後儲存、重新整理確認，再恢復測試前薄荷套裝／貝雷帽／星頁手帳。未新增帳目、未花費星幣。
- 開啟減少動態後，造型間影片數為 0、粒子隱藏、人物仍可見；已恢復原本關閉減少動態的設定。
- 主線、帳本與貨幣程式未改寫；本輪未重新跑雲端模擬器，雲端交易測試沿用前一輪的檢查紀錄，不把它算成本輪新驗證。

本輪範圍是首頁與造型間的視覺／操作切片，以及共用角色與導覽；冒險舞台和手帳內容尚未全面改成此視覺。Cloudflare 正式站沒有部署這次試作。此版本仍需要使用者看過實機後評價畫風，不將這次嘗試視為已通過最終美術驗收。
