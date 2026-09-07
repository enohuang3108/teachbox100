"""產生 memory 封面（warm 版）。

幾何圖形直接用 PIL 畫就夠，不必外掛 SVG rasterizer。
底色沿用其他封面的米色，cutout-covers.py 才吃得到。
用法：python3 scripts/gen-new-covers.py && python3 scripts/cutout-covers.py
"""

import pathlib
import subprocess

from PIL import Image, ImageDraw

BG = (247, 240, 229)
INK = (31, 41, 55)
SIZE = (1024, 768)
SS = 3  # 超取樣倍率，畫完再縮小當抗鋸齒
OUT = pathlib.Path("public/images/covers/warm")


def canvas():
    """畫布用透明底，save() 會依實際圖形 bbox 置中後才壓到米色底上。"""
    return Image.new("RGBA", (SIZE[0] * SS, SIZE[1] * SS), (0, 0, 0, 0))


def save(img, name, margin=0.10):
    """裁到圖形 bbox、等比放大到留白 margin 為止，再置中貼上米色底。"""
    art = img.crop(img.getbbox())
    box_w, box_h = (int(SIZE[0] * (1 - 2 * margin)), int(SIZE[1] * (1 - 2 * margin)))
    scale = min(box_w / art.width, box_h / art.height)
    art = art.resize((max(1, int(art.width * scale)), max(1, int(art.height * scale))),
                     Image.LANCZOS)
    img = Image.new("RGB", SIZE, BG)
    img.paste(art, ((SIZE[0] - art.width) // 2, (SIZE[1] - art.height) // 2), art)
    png = OUT / f"{name}.png"
    img.save(png)
    subprocess.run(["cwebp", "-q", "88", str(png), "-o", str(OUT / f"{name}.webp")], check=True)
    png.unlink()


def rect(d, x, y, w, h, fill, width=2):
    d.rectangle([x, y, x + w, y + h], fill=fill, outline=INK, width=width * SS)


def memory():
    """六張牌：四張阿黃卡背（黑底、米白大眼），兩張翻開的同色圓形當已配對的一組。"""
    img = canvas()
    d = ImageDraw.Draw(img)
    cream, amber = (252, 251, 252), (245, 158, 11)
    w, h, gap, r = 190 * SS, 250 * SS, 28 * SS, 22 * SS
    ox, oy = 130 * SS, 110 * SS
    for i in range(6):
        x = ox + (i % 3) * (w + gap)
        y = oy + (i // 3) * (h + gap)
        face_up = i in (1, 5)
        if face_up:
            d.rounded_rectangle([x, y, x + w, y + h], r, fill=cream, outline=INK, width=3 * SS)
            cx, cy, cr = x + w // 2, y + h // 2, 62 * SS
            d.ellipse([cx - cr, cy - cr, cx + cr, cy + cr], fill=amber, outline=INK, width=3 * SS)
        else:
            d.rounded_rectangle([x, y, x + w, y + h], r, fill=INK)
            for ex in (x + w * 0.36, x + w * 0.64):
                ey = y + h * 0.42
                d.ellipse([ex - 22 * SS, ey - 30 * SS, ex + 22 * SS, ey + 30 * SS], fill=cream)
                d.ellipse([ex - 11 * SS, ey - 11 * SS, ex + 11 * SS, ey + 11 * SS], fill=INK)
    save(img, "memory")


if __name__ == "__main__":
    memory()
    print("done")
