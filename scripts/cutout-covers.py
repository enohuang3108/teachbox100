"""把 covers/warm/ 的米色底去掉，輸出到 covers/cutout/。

兩個坑，兩層防護：

1. 從邊界 flood fill 會沿細縫漏進物件內部（時鐘錶面、天平托盤）。
   → 先把前景膨脹 SEAL/2 px 封住細縫，填完再長回來。
2. 有些物件本身就是米白色（大富翁那顆骰子），寬鬆比色會整顆吃掉。
   → 填色用嚴格門檻 FILL_SUM：底色很平（每通道抖動 <2），
     骰子面／錶面跟底色差 6~18，剛好擋得住。

反鋸齒的邊緣像素比底色暗一點，嚴格門檻清不掉會留一圈米色光暈，
所以「長回來」那步改用寬鬆門檻 EDGE_SUM，只在原本就接近底色的像素上長。

用法：python3 scripts/cutout-covers.py
"""

from collections import deque
import pathlib

import numpy as np
from PIL import Image, ImageFilter

SRC = pathlib.Path("public/images/covers/warm")
DST = pathlib.Path("public/images/covers/cutout")
EDGE_SUM = 60  # 清邊緣光暈時的寬鬆門檻
RING = 8       # 最外圈這幾 px 一定是背景，用來量底色自己的抖動幅度
SEAL = 9       # 封縫用的膨脹核（奇數）；擋得住寬度 < SEAL-1 px 的縫


def dilate(mask: np.ndarray, size: int) -> np.ndarray:
    img = Image.fromarray((mask * 255).astype(np.uint8), "L")
    return np.asarray(img.filter(ImageFilter.MaxFilter(size))) > 127


def cutout(path: pathlib.Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    a = np.asarray(im).astype(np.int16)
    h, w = a.shape[:2]

    # 底色取四角中位數，避免某個角剛好被插畫佔到
    corners = [a[1, 1, :3], a[1, w - 2, :3], a[h - 2, 1, :3], a[h - 2, w - 2, :3]]
    bg = np.median(np.stack(corners), axis=0)
    dev = np.abs(a[:, :, :3] - bg).sum(axis=2)

    # flood fill 的門檻不寫死：最外圈一定是背景，量它自己的最大抖動當上限。
    # 底色乾淨的圖（monopoly）門檻自動收緊，同色的骰子才擋得住；
    # 底色帶方格紋的圖（clock）門檻自動放寬，格線才走得過去。
    ring = np.concatenate([
        dev[:RING].ravel(), dev[-RING:].ravel(),
        dev[:, :RING].ravel(), dev[:, -RING:].ravel(),
    ])
    fill_sum = ring.max() + 2

    # 封縫只用「真正的物件邊」當障礙物：拿 fill_sum 去封的話，底色的細微
    # 雜訊也會被膨脹成一片障礙，開闊的背景反而填不動。
    passable = (dev <= fill_sum) & ~dilate(dev > EDGE_SUM, SEAL)

    outside = np.zeros((h, w), dtype=bool)
    q = deque()
    for y, x in (
        [(0, x) for x in range(w)]
        + [(h - 1, x) for x in range(w)]
        + [(y, 0) for y in range(h)]
        + [(y, w - 1) for y in range(h)]
    ):
        if passable[y, x] and not outside[y, x]:
            outside[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and passable[ny, nx] and not outside[ny, nx]:
                outside[ny, nx] = True
                q.append((ny, nx))

    out = np.asarray(im).copy()
    out[dilate(outside, SEAL + 2) & (dev <= EDGE_SUM), 3] = 0
    return Image.fromarray(out, "RGBA")


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    for f in sorted(SRC.glob("*.webp")):
        img = cutout(f)
        img.save(DST / f.name, "WEBP", quality=88, method=6)
        print(f"{f.name}: cleared {100 * (np.asarray(img)[:, :, 3] == 0).mean():.0f}%")


if __name__ == "__main__":
    main()
