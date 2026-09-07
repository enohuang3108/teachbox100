"""用 OpenAI gpt-image-2 產生 memory 封面（warm 版），以抽籤機封面當風格參考圖。

API key 放 macOS 鑰匙圈：security add-generic-password -s openai-api-key-for-image -a openai -w <key>
生出來的圖底色跟專案米色差幾階、也不是 4:3，所以事後把接近底色的像素統一成 BG、
裁到圖形 bbox 置中成 1024x768，cutout-covers.py 才去得掉背景。
用法：python3 scripts/gen-memory-cover.py && python3 scripts/cutout-covers.py
"""

import base64
import json
import pathlib
import subprocess
import sys
import urllib.request

import numpy as np
from PIL import Image

BG = (247, 240, 229)
SIZE = (1024, 768)
MARGIN = 0.10
BG_TOL = 20  # 生成圖底色抖動 <1/通道，翻開的米白卡牌距離 >30，取中間
OUT = pathlib.Path("public/images/covers/warm/memory.webp")
REF = pathlib.Path("public/images/covers/warm/lottery.webp")

PROMPT = """Redraw this scene in EXACTLY the same illustration style as the attached reference image (same flat risograph-print look, same black dog mascot Barkley, same cream paper background).

THE ONE STYLE RULE: every object is ONE SOLID FLAT SHAPE with details KNOCKED OUT of it in cream. No outlines, no strokes, no gradients, no shadows, no 3D, no highlights. Chunky, slightly hand-drawn edges. Subtle print grain on every filled shape.

COLORS, flat, exactly these: cream #F8F0E3 · black #0D0D0D · red #CB2108 · green #2C5427 · gold #F8B003 · blue #02569B.
Barkley's black and the card backs' black are the SAME #0D0D0D.

SCENE — a memory card matching game:
Six rounded playing cards laid on the paper in a 3x2 grid, cards fairly large.
Four cards are FACE DOWN: each is one solid black #0D0D0D rounded rectangle with two big cream eyes knocked out of it (two cream ovals, each with a black round pupil), like Barkley's own eyes — the card back is a little Barkley face.
Two cards are FACE UP: each is a cream #F8F0E3 rounded rectangle showing ONE solid red #CB2108 apple (a chunky round apple shape with a small solid green #2C5427 leaf, a tiny cream highlight dot knocked out is allowed). The two apples are identical: a matched pair.
Barkley STANDS UPRIGHT on his hind legs at the right side, using his front paws as hands: one paw is flipping over the last face-up card, the other paw is raised in delight. Pure black silhouette with two cream eyes, fully inside the frame, not cropped. Keep a clear gap between his arms and torso; his paws must read clearly on top of the cream card.

CANVAS: landscape, cream #F8F0E3 background edge to edge, generous empty paper around everything. NO TEXT anywhere."""


def keychain_key() -> str:
    return subprocess.check_output(
        ["security", "find-generic-password", "-s", "openai-api-key-for-image", "-w"]
    ).decode().strip()


def generate(model: str = "gpt-image-2") -> Image.Image:
    boundary = "----teachbox-cover"
    ref_png = pathlib.Path("/tmp/memory-ref.png")
    Image.open(REF).convert("RGB").save(ref_png)
    fields = {"model": model, "prompt": PROMPT, "size": "1536x1024", "quality": "high", "n": "1"}
    body = b""
    for k, v in fields.items():
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    body += (
        f'--{boundary}\r\nContent-Disposition: form-data; name="image[]"; filename="ref.png"\r\n'
        "Content-Type: image/png\r\n\r\n"
    ).encode() + ref_png.read_bytes() + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/images/edits",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {keychain_key()}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        res = json.load(r)
    raw = pathlib.Path("/tmp/memory-raw.png")
    raw.write_bytes(base64.b64decode(res["data"][0]["b64_json"]))
    print("raw ->", raw, res.get("usage"))
    return Image.open(raw).convert("RGB")


def fit(im: Image.Image) -> Image.Image:
    """底色統一成 BG、裁到圖形 bbox、等比縮到留白 MARGIN、置中貼上米色底。"""
    a = np.asarray(im).astype(int)
    corner = np.median(np.concatenate([a[:8, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)]), axis=0)
    d = np.abs(a - corner).sum(axis=2)
    a[d < BG_TOL] = BG
    ys, xs = np.where(d >= BG_TOL)
    art = Image.fromarray(a.astype(np.uint8)).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    box = (int(SIZE[0] * (1 - 2 * MARGIN)), int(SIZE[1] * (1 - 2 * MARGIN)))
    sc = min(box[0] / art.width, box[1] / art.height)
    art = art.resize((int(art.width * sc), int(art.height * sc)), Image.LANCZOS)
    out = Image.new("RGB", SIZE, BG)
    out.paste(art, ((SIZE[0] - art.width) // 2, (SIZE[1] - art.height) // 2))
    return out


if __name__ == "__main__":
    src = Image.open(sys.argv[1]).convert("RGB") if len(sys.argv) > 1 else generate()
    png = OUT.with_suffix(".png")
    fit(src).save(png)
    subprocess.run(["cwebp", "-quiet", "-q", "88", str(png), "-o", str(OUT)], check=True)
    png.unlink()
    print("done", OUT)
