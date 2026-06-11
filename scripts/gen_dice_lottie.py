"""從原始骰子 Lottie 產生 6 支「落在 N」的動畫，六面點數合理且風格不變。

原動畫是手繪逐幀變形的 2.5D 骰子，落定 hero pose 由三個可見面組成：
  頂面 = base-r-22(白底) + 6_5(點) / dots(點)
  左面 = base-r-8(白底)  + 5_2(點)
  右面 = base-r-7(白底)  + 3_5(點)
每個面的「點」是跟著白底面一起逐幀變形的。我們沿用這些點，只「選取子集」
擺出正確的數字 —— 風格與變形 100% 不變。

頂面顯示 N；面對 user 的兩個側面顯示 N 的合法鄰面（對面和為 7、互不為對面），
不再固定是 5 和 3。
"""

import json, copy, os
import numpy as np

SRC = "lib/monopoly/dice-roll.lottie.json"
OUT_DIR = "public/lottie/dice"
os.makedirs(OUT_DIR, exist_ok=True)

base = json.load(open(SRC))


def comp3(doc):
    return next(a for a in doc["assets"] if a["id"].startswith("comp_3"))


def layer(doc, nm):
    return next(l for l in comp3(doc)["layers"] if l.get("nm") == nm)


# === 每個面已知的點格座標（從烤好的點的最終中心反推）===
TOP_REF = {"TL": (-43.8, -22.9), "TR": (39.1, -25.5), "BL": (-38.7, 18.5),
           "BR": (44.2, 15.9), "TC": (-2.6, -24.2), "BC": (2.5, 17.5)}
LEFT_REF = {"TL": (-91.3, 53.3), "TR": (-32.6, 82.6), "BL": (-91.3, 125.1),
            "BR": (-32.6, 154.4), "C": (-61.8, 103.7)}
RIGHT_REF = {"TR": (91.8, 53.3), "BL": (33.2, 154.5), "C": (62.7, 104.0)}

# 頂面中心點（合成用）：四角平均
_TOP_C = (sum(TOP_REF[c][0] for c in ("TL", "TR", "BL", "BR")) / 4,
          sum(TOP_REF[c][1] for c in ("TL", "TR", "BL", "BR")) / 4)
TOP_SYNTH = {"C": ("BC", (_TOP_C[0] - TOP_REF["BC"][0], _TOP_C[1] - TOP_REF["BC"][1]))}

# === 各數字的點格 ===
TOP_PAT = {1: ["C"], 2: ["TL", "BR"], 3: ["TL", "C", "BR"],
           4: ["TL", "TR", "BL", "BR"], 5: ["TL", "TR", "C", "BL", "BR"],
           6: ["TL", "TR", "BL", "BR", "TC", "BC"]}
LEFT_PAT = {1: ["C"], 2: ["TL", "BR"], 3: ["TL", "C", "BR"],
            4: ["TL", "TR", "BL", "BR"], 5: ["TL", "TR", "C", "BL", "BR"]}
RIGHT_PAT = {1: ["C"], 2: ["TR", "BL"], 3: ["TR", "C", "BL"]}

# 頂面 N → (左面, 右面)。對面和為 7、側面是 N 的合法鄰面、互不為對面。
ASSIGN = {1: (4, 2), 2: (1, 3), 3: (5, 1), 4: (5, 1), 5: (4, 1), 6: (5, 3)}


def final_v(k):
    if isinstance(k, dict):
        return k.get("v")
    if isinstance(k, list) and k and isinstance(k[-1], dict):
        s = k[-1].get("s")
        if isinstance(s, list) and s and isinstance(s[0], dict):
            return s[0].get("v")
    return None


def group_center(g):
    for it in g["it"]:
        if it.get("ty") == "sh":
            v = final_v(it["ks"]["k"])
            if v:
                return (sum(p[0] for p in v) / len(v), sum(p[1] for p in v) / len(v))
    return None


def classify(center, ref):
    return min(ref, key=lambda lab: (center[0] - ref[lab][0]) ** 2 + (center[1] - ref[lab][1]) ** 2)


def translate_group(g, off):
    g = copy.deepcopy(g)
    for it in g["it"]:
        if it.get("ty") == "sh":
            k = it["ks"]["k"]
            if isinstance(k, dict) and "v" in k:
                k["v"] = [[p[0] + off[0], p[1] + off[1]] for p in k["v"]]
            elif isinstance(k, list):
                for kf in k:
                    s = kf.get("s")
                    if isinstance(s, list) and s and isinstance(s[0], dict) and "v" in s[0]:
                        s[0]["v"] = [[p[0] + off[0], p[1] + off[1]] for p in s[0]["v"]]
    return g


def set_face_pips(doc, layer_nm, ref, pattern, synth=None):
    """把某個面的點換成指定數字的點格（沿用烤好的點、只選子集，必要時平移合成）。"""
    l = layer(doc, layer_nm)
    groups = [s for s in l["shapes"] if s.get("ty") == "gr"]
    others = [s for s in l["shapes"] if s.get("ty") != "gr"]
    cellmap = {}
    for g in groups:
        c = group_center(g)
        if c:
            cellmap[classify(c, ref)] = g
    new = []
    for cell in pattern:
        if cell in cellmap:
            new.append(copy.deepcopy(cellmap[cell]))
        elif synth and cell in synth:
            src_cell, off = synth[cell]
            new.append(translate_group(cellmap[src_cell], off))
        else:
            raise ValueError(f"{layer_nm}: 缺少點格 {cell}（可用：{list(cellmap)}）")
    l["shapes"] = others + new


def hide_dots(doc):
    """頂面改成只用 6_5 一路到底，原本 53→80 的 dots 全部藏起來（避免交接跳動）。"""
    for l in comp3(doc)["layers"]:
        if l.get("nm") == "dot":
            l["ks"]["o"]["k"] = 0


def path_k(node):
    """取出某 layer 或 group 裡第一條 path（sh）的 keyframe 串列。"""
    found = [None]

    def walk(items):
        for it in items:
            if found[0] is not None:
                return
            if it.get("ty") == "gr":
                walk(it["it"])
            elif it.get("ty") == "sh":
                found[0] = it["ks"]["k"]

    walk(node["shapes"] if "shapes" in node else node["it"])
    return found[0]


def fit_affine(src, dst):
    """最小平方擬合 2D affine：src 點集 → dst 點集，回傳 (ax, ay)。"""
    S = np.array([[p[0], p[1], 1.0] for p in src])
    ax = np.linalg.lstsq(S, np.array([p[0] for p in dst]), rcond=None)[0]
    ay = np.linalg.lstsq(S, np.array([p[1] for p in dst]), rcond=None)[0]
    return ax, ay


def _pt(ax, ay, p):
    return [ax[0] * p[0] + ax[1] * p[1] + ax[2], ay[0] * p[0] + ay[1] * p[1] + ay[2]]


def _vec(ax, ay, v):  # 切線只套線性部分（不含平移）
    return [ax[0] * v[0] + ax[1] * v[1], ay[0] * v[0] + ay[1] * v[1]]


def track_pips_to_face(doc, pip_nm, face_nm):
    """頂面點原本只動到 t52，之後 hold 住、與仍在變形的頂面脫節。
    用頂面 base 自身 t52→t 的形變（affine）延長點的 keyframe 到最後，
    讓點全程跟著方塊一起縮放/旋轉。"""
    face_k = path_k(layer(doc, face_nm))
    cut = max(kf["t"] for kf in path_k([s for s in layer(doc, pip_nm)["shapes"]
                                        if s.get("ty") == "gr"][0]))
    src_kf = next(kf for kf in face_k if kf["t"] == cut)
    src_v = src_kf["s"][0]["v"]
    later = [kf for kf in face_k if kf["t"] > cut]
    affines = [fit_affine(src_v, kf["s"][0]["v"]) for kf in later]

    for g in [s for s in layer(doc, pip_nm)["shapes"] if s.get("ty") == "gr"]:
        k = path_k(g)
        last = k[-1]  # t == cut，只有 s、沒有時間緩動
        sv, si, so = last["s"][0]["v"], last["s"][0]["i"], last["s"][0]["o"]
        closed = last["s"][0].get("c", True)
        last["o"] = copy.deepcopy(src_kf.get("o", {"x": 0.167, "y": 0.167}))
        last["i"] = copy.deepcopy(src_kf.get("i", {"x": 0.833, "y": 0.833}))
        for j, fkf in enumerate(later):
            ax, ay = affines[j]
            nk = {"t": fkf["t"], "s": [{"c": closed,
                                        "v": [_pt(ax, ay, p) for p in sv],
                                        "i": [_vec(ax, ay, t) for t in si],
                                        "o": [_vec(ax, ay, t) for t in so]}]}
            if j < len(later) - 1:
                nk["o"] = copy.deepcopy(fkf.get("o", {"x": 0.167, "y": 0.167}))
                nk["i"] = copy.deepcopy(fkf.get("i", {"x": 0.833, "y": 0.833}))
            k.append(nk)


for N in range(1, 7):
    doc = copy.deepcopy(base)
    doc["nm"] = f"dice-{N}"
    A, B = ASSIGN[N]
    # 頂面：只用 6_5 一路到 80（點全程跟著頂面變形，無交接跳動）
    set_face_pips(doc, "6_ 5", TOP_REF, TOP_PAT[N], synth=TOP_SYNTH)
    layer(doc, "6_ 5")["op"] = 80
    track_pips_to_face(doc, "6_ 5", "base-r-_22")  # 點延長並跟著頂面 t52→t79 一起動
    hide_dots(doc)
    # 左面 = A、右面 = B（沿用 5_2 / 3_5 的點，選子集）
    set_face_pips(doc, "5_ 2", LEFT_REF, LEFT_PAT[A])
    set_face_pips(doc, "3_ 5", RIGHT_REF, RIGHT_PAT[B])
    out = os.path.join(OUT_DIR, f"dice-{N}.json")
    json.dump(doc, open(out, "w"), separators=(",", ":"))
    print(f"wrote {out}  top={N} left={A} right={B}")
print("done")
