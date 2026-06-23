#!/usr/bin/env python3
"""
normalize_frames.py
用途：把 ffmpeg 拆出的原始幀（RGB，黑底）轉為透明正規化 PNG，存為 f01-f12。
用法：python normalize_frames.py --raw /tmp/outfit_raw --out /path/to/frames/outfit

修正說明：使用跨所有幀的「聯集 bbox」裁切，確保每幀對齊同一區域，消除角色忽胖忽瘦。
"""
import argparse, os
from PIL import Image
import numpy as np

TARGET_CHAR_H  = 556   # 85% of 656
TARGET_BOTTOM_Y = 587
CANVAS_W, CANVAS_H = 350, 656
BLACK_THRESH = 30
MAX_CHAR_W   = 310     # 避免寬型服裝（斗篷等）超出 canvas

def black_to_transparent(img_rgb: Image.Image) -> Image.Image:
    arr = np.array(img_rgb)
    rgba = np.zeros((*arr.shape[:2], 4), dtype=np.uint8)
    rgba[:, :, :3] = arr
    is_black = (arr[:,:,0] < BLACK_THRESH) & (arr[:,:,1] < BLACK_THRESH) & (arr[:,:,2] < BLACK_THRESH)
    rgba[:, :, 3] = np.where(is_black, 0, 255)
    return Image.fromarray(rgba, 'RGBA')

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--raw', required=True, help='原始幀目錄')
    parser.add_argument('--out', required=True, help='輸出目錄（f01-f12.png）')
    args = parser.parse_args()

    raw_files = sorted([f for f in os.listdir(args.raw) if f.endswith('.png')])
    if not raw_files:
        raise SystemExit(f"錯誤：{args.raw} 沒有 PNG 幀")

    print(f"原始幀數：{len(raw_files)}")
    transparent = [
        black_to_transparent(Image.open(os.path.join(args.raw, f)).convert('RGB'))
        for f in raw_files
    ]

    # ── 核心修正：計算跨所有幀的「聯集 bbox」──────────────────────────────
    # 舊版 bug：用各幀自身的 bbox 裁切 → 每幀裁出大小不同 → resize 後角色尺寸忽大忽小
    # 新版修正：先算出所有幀的最小外包矩形（union bbox），再用同一個區域裁所有幀
    x0_all = y0_all = float('inf')
    x1_all = y1_all = 0.0
    for img in transparent:
        bbox = img.getbbox()
        if bbox:
            x0_all = min(x0_all, bbox[0])
            y0_all = min(y0_all, bbox[1])
            x1_all = max(x1_all, bbox[2])
            y1_all = max(y1_all, bbox[3])

    if x0_all == float('inf'):
        raise SystemExit("所有幀都是空的！")

    union_bbox = (int(x0_all), int(y0_all), int(x1_all), int(y1_all))
    max_w = union_bbox[2] - union_bbox[0]
    max_h = union_bbox[3] - union_bbox[1]
    # ───────────────────────────────────────────────────────────────────────

    scale = min(TARGET_CHAR_H / max_h, MAX_CHAR_W / max_w)
    new_w = int(max_w * scale)
    new_h = int(max_h * scale)
    fill_pct = new_h / CANVAS_H * 100
    print(f"聯集 bbox：{union_bbox}  →  {max_w}×{max_h}")
    print(f"scale={scale:.3f}  →  {new_w}×{new_h} ({fill_pct:.0f}% fill)")

    # 均勻選 12 幀
    total = len(transparent)
    indices = [round(i * (total - 1) / 11) for i in range(12)]

    os.makedirs(args.out, exist_ok=True)
    for i, idx in enumerate(indices):
        img = transparent[idx]
        # 用聯集 bbox 裁切（不是 per-frame bbox）→ 所有幀裁出相同大小的區域
        cropped = img.crop(union_bbox)
        resized = cropped.resize((new_w, new_h), Image.LANCZOS)

        canvas = Image.new('RGBA', (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
        paste_x = (CANVAS_W - new_w) // 2
        paste_y = TARGET_BOTTOM_Y - new_h
        canvas.paste(resized, (paste_x, paste_y), resized)
        canvas.save(os.path.join(args.out, f'f{i+1:02d}.png'))

    print(f"✓ f01-f12.png 存到 {args.out}")

    # 快速驗證
    img = Image.open(os.path.join(args.out, 'f01.png'))
    arr = np.array(img)
    alpha = arr[:, :, 3]
    rows = (alpha > 0).any(axis=1)
    cols = (alpha > 0).any(axis=0)
    bottom = len(rows) - rows[::-1].argmax()
    left   = cols.argmax()
    right  = img.size[0] - (len(cols) - cols[::-1].argmax())
    print(f"驗證 f01：bottom={bottom} (目標 587), margin_L={left}, margin_R={right}")

if __name__ == '__main__':
    main()
