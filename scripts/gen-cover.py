"""用 OpenAI gpt-image-2 產封面（warm 版），以阿黃當風格參考圖。

從 gen-memory-cover.py 抽出來的通用版：風格規則共用，各單元只寫 SCENE。
API key 放 macOS 鑰匙圈：security add-generic-password -s openai-api-key-for-image -a openai -w <key>

用法：
    python3 scripts/gen-cover.py timer            # 產生 public/images/covers/warm/timer.webp
    python3 scripts/gen-cover.py timer /tmp/x.png # 跳過生成，只做後製
接著跑 python3 scripts/cutout-covers.py 產去背版。
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
BG_TOL = 34  # 生成圖底色帶印刷顆粒，全部壓平成 BG，cutout 的 flood fill 才走得動
REF = pathlib.Path("public/images/mascot/barkley.webp")  # 姿勢中性；拿別張封面會把姿勢一起抄過來
OUT_DIR = pathlib.Path("public/images/covers/warm")

STYLE = """Draw this scene in EXACTLY the same illustration style as the attached reference image of the black dog mascot Barkley (same flat risograph-print look, same character, cream paper background). Do NOT copy his pose from the reference; pose him as described below.

THE ONE STYLE RULE: every object is ONE SOLID FLAT SHAPE with details KNOCKED OUT of it in cream. No outlines, no strokes, no gradients, no shadows, no 3D, no highlights. Chunky, slightly hand-drawn edges. Subtle print grain on every filled shape.

COLORS, flat, exactly these: cream #F8F0E3 (the paper only) · white #FFFFFF · black #0D0D0D · red #CB2108 · green #2C5427 · gold #F8B003 · blue #02569B.
Barkley's black is #0D0D0D. He is a pure black silhouette with two cream eyes (round black pupils dead centre), fully inside the frame, never cropped, with a clear gap of cream paper between his arms and his torso.

CANVAS: landscape, cream #F8F0E3 background edge to edge, generous empty paper around everything. NO TEXT, NO NUMBERS, NO LETTERS anywhere.

SCENE — """

SCENES = {
    "timer": """a classroom countdown timer.
A single BIG round timer dial fills most of the frame, standing upright on the paper: one solid blue #02569B ring (a thick donut) with the middle KNOCKED OUT to bare cream paper, and a chunky gold #F8B003 arc laid over roughly the last quarter of the ring to show time running out. A small solid black #0D0D0D twist knob sits on top of the dial. Inside the empty middle, ONE solid red #CB2108 pointer needle points up and to the right from the centre — a chunky wedge, not a thin line. NO numerals, NO tick marks, NO text on the dial.
Barkley STANDS UPRIGHT on his hind legs to the right of the dial, slightly smaller than it, one front paw resting flat on the dial's rim as if he just wound it, the other paw planted on his hip with the elbow bent out.""",
    "noise": """a classroom noise meter.
On the left, a row of FIVE upright bars of increasing height standing on the paper, like a volume meter: the two short ones solid green #2C5427, the middle one gold #F8B003, the two tall ones red #CB2108. Each bar is a chunky rounded rectangle, evenly spaced, no outlines.
Barkley SITS on the paper to the right of the bars, upright and alert, holding ONE front paw up flat beside his muzzle in a clear "shhh / quiet down" gesture — paw open, at cheek height, not above his head. His ears are perked. A single solid gold #F8B003 sound-wave arc (one chunky crescent) curves in the empty paper between the tallest red bar and Barkley, aimed at his ear.""",
    "multiplication": """a multiplication practice game.
Centre-left, ONE big multiplication sign — a chunky solid red #CB2108 diagonal cross (X shape), thick arms, hand-drawn edges — standing on the paper. To its right, a solid blue #02569B equals sign (two chunky horizontal bars). NO digits, NO numbers, NO text anywhere; the cross and the equals sign are the only symbols.
Behind and slightly below them, THREE flat rounded cards lie fanned on the paper, each a plain solid shape with nothing written on it: one white #FFFFFF, one gold #F8B003, one green #2C5427.
Barkley STANDS UPRIGHT on his hind legs at the right, roughly as tall as the cross, one front paw raised to point at the multiplication cross, the other paw planted on his hip with the elbow bent out.""",
}


def keychain_key() -> str:
    return subprocess.check_output(
        ["security", "find-generic-password", "-s", "openai-api-key-for-image", "-w"]
    ).decode().strip()


def generate(prompt: str, model: str = "gpt-image-2") -> Image.Image:
    boundary = "----teachbox-cover"
    ref_png = pathlib.Path("/tmp/cover-ref.png")
    Image.open(REF).convert("RGB").save(ref_png)
    fields = {"model": model, "prompt": prompt, "size": "1536x1024", "quality": "high", "n": "1"}
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
    with urllib.request.urlopen(req, timeout=600) as r:
        res = json.load(r)
    raw = pathlib.Path("/tmp/cover-raw.png")
    raw.write_bytes(base64.b64decode(res["data"][0]["b64_json"]))
    print("raw ->", raw, res.get("usage"))
    return Image.open(raw).convert("RGB")


def fit(im: Image.Image) -> Image.Image:
    """底色統一成 BG、裁到圖形 bbox、等比縮到留白 MARGIN、置中貼上米色底。"""
    a = np.asarray(im).astype(int)
    corner = np.median(
        np.concatenate([a[:8, :8].reshape(-1, 3), a[-8:, -8:].reshape(-1, 3)]), axis=0
    )
    d = np.abs(a - corner).sum(axis=2)
    a[d < BG_TOL] = BG
    ys, xs = np.where(d >= BG_TOL)
    art = Image.fromarray(a.astype(np.uint8)).crop(
        (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    )
    box = (int(SIZE[0] * (1 - 2 * MARGIN)), int(SIZE[1] * (1 - 2 * MARGIN)))
    sc = min(box[0] / art.width, box[1] / art.height)
    art = art.resize((int(art.width * sc), int(art.height * sc)), Image.LANCZOS)
    out = Image.new("RGB", SIZE, BG)
    out.paste(art, ((SIZE[0] - art.width) // 2, (SIZE[1] - art.height) // 2))
    return out


if __name__ == "__main__":
    key = sys.argv[1]
    if key not in SCENES:
        sys.exit(f"unknown key: {key}. known: {', '.join(SCENES)}")
    src = (
        Image.open(sys.argv[2]).convert("RGB")
        if len(sys.argv) > 2
        else generate(STYLE + SCENES[key])
    )
    out = OUT_DIR / f"{key}.webp"
    png = out.with_suffix(".png")
    fit(src).save(png)
    subprocess.run(["cwebp", "-quiet", "-q", "88", str(png), "-o", str(out)], check=True)
    png.unlink()
    print("done", out)
