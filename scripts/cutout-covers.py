"""把 covers/warm/ 的米色底去掉，輸出到 covers/cutout/。

兩個坑，兩層防護：

1. 從邊界 flood fill 會沿細縫漏進物件內部（時鐘錶面、天平托盤）。
   → 先把前景膨脹 SEAL/2 px 封住細縫，填完再長回來。
2. 有些物件本身就是米白色（大富翁那顆骰子），寬鬆比色會整顆吃掉。
   → 填色用嚴格門檻 FILL_SUM：底色很平（每通道抖動 <2），
     骰子面／錶面跟底色差 6~18，剛好擋得住。

反鋸齒的邊緣像素比底色暗一點，嚴格門檻清不掉會留一圈米色光暈，
所以「長回來」那步改用寬鬆門檻 EDGE_SUM，只在原本就接近底色的像素上長。

3. 封縫會把物件之間的窄縫整條堵死，長回來只從兩側各長 5px，中間那條底色留在
   圖上就是毛邊；剩下的混色像素全不透明，在深色背景上會鑲一圈淡邊。
   → 底色乾淨的圖（fill_sum <= TIGHT_BG，gen-memory-cover.py 產的那批）多跑
     一輪：清掉走得到的純底色像素，再把貼著透明區的那一圈改成半透明並反預乘。
     底色本身就髒的圖（時鐘的方格紋）跳過這一輪，維持原本行為。

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
TIGHT_BG = 4   # fill_sum 低於這個值才算「底色乾淨」，才跑第二次不封縫的清除
HALO = 7       # 削反鋸齒環的膨脹核（奇數），每輪各長 3px


def flood_from_border(passable: np.ndarray) -> np.ndarray:
    """從畫布四邊往內填，回傳所有從外面走得到的像素。"""
    h, w = passable.shape
    seen = np.zeros((h, w), dtype=bool)
    q = deque()
    for y, x in (
        [(0, x) for x in range(w)]
        + [(h - 1, x) for x in range(w)]
        + [(y, 0) for y in range(h)]
        + [(y, w - 1) for y in range(h)]
    ):
        if passable[y, x] and not seen[y, x]:
            seen[y, x] = True
            q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < h and 0 <= nx < w and passable[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


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

    outside = flood_from_border(passable)

    out = np.asarray(im).copy()
    out[dilate(outside, SEAL + 2) & (dev <= EDGE_SUM), 3] = 0

    # 封縫會把物件之間的窄縫整條堵死，長回來那步只從兩側各長 5px，中間那條底色
    # 就留在圖上變成毛邊。底色夠乾淨時再補一輪：用寬鬆門檻走位（才跨得過物件邊緣
    # 的反鋸齒環），但只清掉「顏色就是底色」的像素。時鐘錶面、大富翁骰子跟底色差
    # 6~18，走得到也不會被清掉；底色本身就髒的圖 fill_sum 大於 TIGHT_BG，直接跳過。
    if fill_sum <= TIGHT_BG:
        out[flood_from_border(dev <= EDGE_SUM) & (dev <= fill_sum), 3] = 0
        # 清完窄縫後，縫裡剩下的是物件邊緣的反鋸齒環（底色與墨色的混色）。
        # 只削「同時貼著已透明區、又貼著真正物件邊」的那一圈，白卡片內部離透明區
        # 很遠，不會被咬到。
        for _ in range(2):
            edge = dilate(dev > EDGE_SUM, HALO)
            out[dilate(out[:, :, 3] == 0, HALO) & edge & (dev <= EDGE_SUM), 3] = 0

        # 剩下的是墨色與底色的混色像素：全不透明就會在深色背景上鑲一圈淡邊。
        # 貼著透明區的那一小圈改成半透明，並反預乘把底色抽掉，邊緣才乾淨。
        # 參考色距取鄰域最大值，而不是固定門檻：黑卡片跟底色差 ~700、白卡片只差
        # ~50，用同一個分母會把白卡片整圈判成半透明。
        # MaxFilter 只吃 8-bit，色距先壓到 0~255 再放大回來
        ref = np.asarray(
            Image.fromarray((np.clip(dev, 0, 765) // 3).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(HALO))
        ).astype(np.float64) * 3
        band = dilate(out[:, :, 3] == 0, HALO) & (out[:, :, 3] > 0) & (dev < ref)
        if band.any():
            alpha = np.clip(dev[band] / np.maximum(ref[band], 1.0), 0.0, 1.0)
            rgb = out[band, :3].astype(np.float64)
            # P = a*C + (1-a)*bg → C = (P - (1-a)*bg) / a
            safe = np.maximum(alpha, 0.05)[:, None]
            out[band, :3] = np.clip((rgb - (1 - safe) * bg) / safe, 0, 255)
            out[band, 3] = (alpha * 255).astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    for f in sorted(SRC.glob("*.webp")):
        img = cutout(f)
        img.save(DST / f.name, "WEBP", quality=88, method=6)
        print(f"{f.name}: cleared {100 * (np.asarray(img)[:, :, 3] == 0).mean():.0f}%")


if __name__ == "__main__":
    main()
