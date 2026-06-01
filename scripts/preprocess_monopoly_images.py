#!/usr/bin/env python3
"""預處理大富翁素材：切分景點格、去背（保留內部白）、裁切置中、輸出透明 512 webp。"""
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path("public/images/monopoly")
OUT = SRC / "processed"
OUT.mkdir(exist_ok=True)

CANVAS = 512
WHITE_THRESH = 232  # 近白判定
PAD_RATIO = 0.06    # 裁切後留白比例


def remove_bg(img: Image.Image) -> Image.Image:
    """移除與邊界相連的近白背景，保留物件內部的白色。"""
    arr = np.array(img.convert("RGBA"))
    h, w = arr.shape[:2]
    rgb = arr[:, :, :3].astype(np.int16)
    white = (
        (rgb[:, :, 0] >= WHITE_THRESH)
        & (rgb[:, :, 1] >= WHITE_THRESH)
        & (rgb[:, :, 2] >= WHITE_THRESH)
    )
    visited = np.zeros((h, w), bool)
    dq: deque = deque()

    def seed(y, x):
        if white[y, x] and not visited[y, x]:
            visited[y, x] = True
            dq.append((y, x))

    for x in range(w):
        seed(0, x)
        seed(h - 1, x)
    for y in range(h):
        seed(y, 0)
        seed(y, w - 1)

    while dq:
        y, x = dq.popleft()
        if y > 0:
            seed(y - 1, x)
        if y < h - 1:
            seed(y + 1, x)
        if x > 0:
            seed(y, x - 1)
        if x < w - 1:
            seed(y, x + 1)

    arr[:, :, 3][visited] = 0
    return Image.fromarray(arr, "RGBA")


def trim_and_fit(img: Image.Image) -> Image.Image:
    """依 alpha 裁切到內容範圍，加留白後置中縮放到 CANVAS 正方形透明畫布。"""
    bbox = img.getbbox()
    if bbox is None:
        return img.resize((CANVAS, CANVAS))
    img = img.crop(bbox)
    w, h = img.size
    side = max(w, h)
    pad = int(side * PAD_RATIO)
    side += pad * 2
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - w) // 2, (side - h) // 2), img)
    return square.resize((CANVAS, CANVAS), Image.Resampling.LANCZOS)


def process(img: Image.Image, name: str):
    out = trim_and_fit(remove_bg(img))
    path = OUT / f"{name}.webp"
    out.save(path, format="WEBP", lossless=True, quality=100, method=6)
    print(f"  -> {path} ({out.size[0]}x{out.size[1]})")


def split_grid(path: Path, rows: int, cols: int):
    """將格狀圖切成 rows*cols 個 cell（先內縮去除分隔線再交給去背）。"""
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    cw, ch = w / cols, h / rows
    inset = int(min(cw, ch) * 0.03)  # 內縮吃掉格線
    cells = []
    for r in range(rows):
        for c in range(cols):
            left = int(c * cw) + inset
            top = int(r * ch) + inset
            right = int((c + 1) * cw) - inset
            bottom = int((r + 1) * ch) - inset
            cells.append(img.crop((left, top, right, bottom)))
    return cells


def main():
    singles = {"機會卡": "chance", "命運卡": "fate", "房子": "house"}
    for zh, en in singles.items():
        src = SRC / f"{zh}.png"
        if src.exists():
            print(f"[single] {zh}.png")
            process(Image.open(src), en)

    grid = SRC / "景點.png"
    if grid.exists():
        print("[grid] 景點.png -> 16 cells")
        for i, cell in enumerate(split_grid(grid, 4, 4), start=1):
            process(cell, f"landmark-{i:02d}")


if __name__ == "__main__":
    main()
