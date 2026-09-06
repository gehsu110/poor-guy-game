"""Export an existing illustration crop in the renderer's coordinate system.

Requires Pillow. Resized background-removal output is normalized BEFORE cropping.
Example: python3 tools/export_character_crop.py source.png head.webp --part head
"""

import argparse
import json
from pathlib import Path

from PIL import Image

LAYOUT = Path(__file__).resolve().parents[1] / "src/character/wind-rig-layout.json"


def crop_part(source, layout, part):
    canvas = layout["canvas"]
    width, height = canvas["width"], canvas["height"]
    if abs((source.width / source.height) / (width / height) - 1) > 0.002:
        raise ValueError("Source aspect ratio differs from the rig; register it first.")
    rect = layout[part]
    x, y, w, h = (rect[key] for key in ("x", "y", "width", "height"))
    if min(x, y) < 0 or min(w, h) <= 0 or x + w > width or y + h > height:
        raise ValueError("Crop lies outside the canonical canvas.")
    normalized = source.convert("RGBA").resize(
        (width, height), Image.Resampling.LANCZOS
    )
    return normalized.crop((x, y, x + w, y + h))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--part", default="head", choices=("head", "portrait"))
    args = parser.parse_args()
    with Image.open(args.source) as source:
        result = crop_part(source, json.loads(LAYOUT.read_text()), args.part)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.output, quality=93, method=6)
    print(f"{args.output}: {result.width} × {result.height}")


if __name__ == "__main__":
    main()
