"""卡面去背：從邊界 flood fill 掉米色紙底，卡片內部的米色留著。"""
from collections import deque
import numpy as np, pathlib
from PIL import Image

S = 512
for name, out in (("chance", "chance-v2"), ("fate", "fate-v2")):
    im = Image.open(f"/tmp/mono-cards/{name}.png").convert("RGB")
    a = np.asarray(im).astype(int)
    bg = np.median(a[:8, :8].reshape(-1, 3), axis=0)
    d = np.abs(a - bg).sum(axis=2)
    near = d < 40                      # 底色帶顆粒，抖動約 20
    h, w = near.shape
    seen = np.zeros((h, w), bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near[y, x]: seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near[y, x]: seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0 <= ny < h and 0 <= nx < w and near[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    # 邊緣抗鋸齒：離底色越遠越不透明
    alpha = np.clip((d - 12) / 28.0, 0, 1) * 255
    alpha[~seen] = 255                 # 卡片內部（含米色卡面）全不透明
    rgba = np.dstack([a, alpha]).astype(np.uint8)
    art = Image.fromarray(rgba, "RGBA")
    ys, xs = np.where(alpha > 8)
    art = art.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    sc = (S * 0.94) / max(art.size)
    art = art.resize((round(art.width * sc), round(art.height * sc)), Image.LANCZOS)
    canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    canvas.paste(art, ((S - art.width) // 2, (S - art.height) // 2), art)
    p = pathlib.Path(f"public/images/monopoly/{out}.webp")
    canvas.save(p, "WEBP", quality=90, method=6)
    print(p, canvas.size)
