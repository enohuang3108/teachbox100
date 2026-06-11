"""將大富翁角色 PNG 置中、轉成正方形 256×256 webp。

來源 PNG 本身已是去背的 RGBA，故只需依 alpha 裁切到本體 bounding box、置中
補成透明正方形、縮放後輸出 webp。

來源：public/images/monopoly/character/image-*.png（隨機檔名）
輸出：public/images/monopoly/character/<animal-slug>.webp
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "public/images/monopoly/character"

# 隨機檔名 → 動物 slug（與 lib/monopoly/characters.ts 對應）
MAPPING = {
    "image-6tjeSWZ75BBsC1S0UvykLu51RWc4yi": "pufferfish",
    "image-AFCaX1qXbrgu06ZEO0FPtzC6RxB2l1": "quokka",
    "image-BLC7DlUuUilmgOtymVJ3m3n9pc4qHX": "jellyfish",
    "image-gEIDnpHyeTfOlGsyYl8Dw84fext550": "tiger",
    "image-gJ8GGAt2UUg7VIVLXxUTGds5AjtVeS": "cockatiel",
    "image-H2oj2zpljRvKTAoKi3Xfvl6e4NAggc": "black-cat",
    "image-J14NRlzuctPUZUvyF6wuJCPwkkSxYR": "chow-chow",
    "image-jJNJJQqHkkFHfAGbn4VqkazVbnNYDu": "dolphin",
    "image-NvHhn0NcVc4MEJZD3yzVyGKOkkC2zU": "duck",
    "image-o0oY17HS9gbKLar6oN248njLIrzFg4": "deer",
    "image-oL4tq7dny3xiUz0wTfjqaRqErdXKqA": "whale-shark",
    "image-p3rNEkcSr85K28Q4GBMKTaznZKcIwa": "elephant",
    "image-QRql2F5P3y5mNxjrEtdr7E9G5DInHq": "dinosaur",
    "image-RxKIsUQua5G40s0aDNEDUH9kTLrD0G": "hedgehog",
    "image-t5XakJ5zvW9AvNbIGzOeZJwW7VhNMq": "penguin",
    "image-tIxGcVKuutdicL6bBwbwpXLpWSrKyo": "sheep",
    "image-x7EbaqD36M4CAPQ1uymaGTn86IPhcu": "blobfish",
    "image-xf4KU9S8oQKYXkXQGnMkKCd3HgdNPs": "panda",
    "image-Zg7Hcv2zm4wPdQiauJJe4qzQrpRlCk": "capybara",
    "image-zqeBsbXm20k3i1ctGD3TB18sr7FaL8": "meerkat",
}

SIZE = 256       # 輸出邊長
MARGIN = 0.08    # 置中後四周留白比例
ALPHA_CUT = 12   # 大於此 alpha 才算本體（濾掉柔邊雜訊）


def trim_to_alpha(img: Image.Image) -> Image.Image:
    """依 alpha 裁切到不透明 bounding box。"""
    rgba = img.convert("RGBA")
    alpha = np.asarray(rgba)[:, :, 3]
    ys, xs = np.where(alpha > ALPHA_CUT)
    if len(ys) == 0:
        return rgba
    return rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def to_square(img: Image.Image) -> Image.Image:
    """置中貼到透明正方形畫布並縮放至 SIZE。"""
    w, h = img.size
    side = max(w, h)
    pad = int(side * MARGIN)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    ox = (canvas.width - w) // 2
    oy = (canvas.height - h) // 2
    canvas.paste(img, (ox, oy), img)
    return canvas.resize((SIZE, SIZE), Image.LANCZOS)


def main() -> None:
    converted = 0
    for stem, slug in MAPPING.items():
        src = SRC_DIR / f"{stem}.png"
        if not src.exists():
            print(f"⚠ 找不到 {src.name}")
            continue
        out = to_square(trim_to_alpha(Image.open(src)))
        dst = SRC_DIR / f"{slug}.webp"
        out.save(dst, "WEBP", quality=90, method=6)
        converted += 1
        print(f"✓ {src.name} → {dst.name}")
    print(f"\n完成 {converted}/{len(MAPPING)} 張")


if __name__ == "__main__":
    main()
