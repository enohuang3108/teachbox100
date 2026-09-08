#!/usr/bin/env python3
"""Google Search Console 關鍵字排名查詢。

用法:
    python3 scripts/gsc-rank.py                    # 近 28 天，依曝光排序
    python3 scripts/gsc-rank.py --days 7 --limit 50
    python3 scripts/gsc-rank.py --dimensions query,page
    python3 scripts/gsc-rank.py --json             # 原始 JSON
    python3 scripts/gsc-rank.py --record           # 追加到 docs/seo/history.md

憑證: ~/.config/claude-seo/service_account.json（或設 GSC_SERVICE_ACCOUNT）
"""
import argparse, datetime as dt, json, os, re, sys

from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession

SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
DEFAULT_KEY = os.path.expanduser("~/.config/claude-seo/service_account.json")
BASE = "https://searchconsole.googleapis.com/webmasters/v3/sites/{}"
API = BASE + "/searchAnalytics/query"
INSPECT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect"
HISTORY = "docs/seo/history.md"
HEADER = "## 搜尋排名紀錄"


def fetch(session, prop, body, limit):
    """分頁抓滿 limit 筆。GSC 單次最多 25000 列。"""
    rows, start = [], 0
    while len(rows) < limit:
        page = dict(body, rowLimit=min(25000, limit - len(rows)), startRow=start)
        r = session.post(API.format(prop.replace("/", "%2F")), json=page)
        if not r.ok:
            sys.exit(f"GSC API {r.status_code}: {r.text[:400]}")
        batch = r.json().get("rows", [])
        rows += batch
        if len(batch) < page["rowLimit"]:
            break
        start += len(batch)
    return rows


def index_status(session, prop):
    """逐頁用 URL 檢查 API 查真實索引數。

    sitemap 回報的 contents.indexed 欄位 Google 早已不再填值（永遠 0），
    不能拿來判斷索引狀態，只能靠 URL Inspection 一頁一頁問。
    """
    r = session.get(BASE.format(prop.replace("/", "%2F")) + "/sitemaps")
    urls = []
    for sm in r.json().get("sitemap", []) if r.ok else []:
        x = session.get(sm["path"])
        if x.ok:
            urls += re.findall(r"<loc>(.*?)</loc>", x.text)
    indexed = 0
    for u in urls:
        v = session.post(INSPECT, json={"inspectionUrl": u, "siteUrl": prop})
        if not v.ok:  # 配額 2000/日，超過就別讓整支掛掉
            return len(urls), None
        state = v.json().get("inspectionResult", {}).get("indexStatusResult", {})
        indexed += state.get("verdict") == "PASS"
    return len(urls), indexed


def record(rows, prop, start, end, submitted, indexed):
    """把當次快照追加到 history.md 的排名區塊。"""
    clicks = sum(r["clicks"] for r in rows)
    imps = sum(r["impressions"] for r in rows)
    # 平均排名要用曝光加權，直接平均會被長尾低曝光關鍵字拉歪
    pos = round(sum(r["position"] * r["impressions"] for r in rows) / imps, 1) if imps else "-"
    top = rows[0]["keys"][0] if rows else "-"
    line = (f"| {dt.date.today()} | {start} ~ {end} | {indexed}/{submitted} | "
            f"{len(rows)} | {imps} | {clicks} | {pos} | {top} |\n")

    text = open(HISTORY).read() if os.path.exists(HISTORY) else ""
    if HEADER not in text:
        text += (f"\n{HEADER}\n\n每次跑 `python3 scripts/gsc-rank.py --record` 追加一列。"
                 f"資料來自 Google Search Console（延遲約 2 天）。\n\n"
                 "| 記錄日 | 資料區間 | 已索引/提交 | 關鍵字數 | 曝光 | 點擊 | 平均排名 | 最高曝光關鍵字 |\n"
                 "|---|---|---|---|---|---|---|---|\n")
    open(HISTORY, "w").write(text + line)
    print(f"\n已追加到 {HISTORY}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--property", default=os.environ.get("GSC_PROPERTY", "sc-domain:teachbox100.com"))
    p.add_argument("--days", type=int, default=28)
    p.add_argument("--limit", type=int, default=100)
    p.add_argument("--dimensions", default="query")
    p.add_argument("--json", action="store_true")
    p.add_argument("--record", action="store_true", help="追加一列到 docs/seo/history.md")
    a = p.parse_args()

    key = os.environ.get("GSC_SERVICE_ACCOUNT", DEFAULT_KEY)
    if not os.path.exists(key):
        sys.exit(f"找不到憑證: {key}\n把 service account JSON 放到這個路徑，或設 GSC_SERVICE_ACCOUNT。")

    # GSC 資料延遲約 2 天，結束日往前推才不會拿到空窗
    end = dt.date.today() - dt.timedelta(days=2)
    dims = [d.strip() for d in a.dimensions.split(",") if d.strip()]
    body = {
        "startDate": str(end - dt.timedelta(days=a.days)),
        "endDate": str(end),
        "dimensions": dims,
        "type": "web",
    }

    creds = service_account.Credentials.from_service_account_file(key, scopes=[SCOPE])
    session = AuthorizedSession(creds)
    rows = fetch(session, a.property, body, a.limit)
    rows.sort(key=lambda r: -r["impressions"])

    if a.json:
        print(json.dumps({"property": a.property, "range": [body["startDate"], body["endDate"]], "rows": rows},
                         ensure_ascii=False, indent=2))
        return

    submitted, indexed = index_status(session, a.property)
    print(f"{a.property}  {body['startDate']} ~ {body['endDate']}  "
          f"共 {len(rows)} 筆　已索引 {indexed}/{submitted} 頁\n")
    if not rows:
        print("沒有排名資料。" + ("網站尚未被索引，先等 Google 收錄。" if indexed == 0
                                      else "已索引但還沒有搜尋曝光，新站正常，靠時間累積。"))
        if a.record:
            record(rows, a.property, body["startDate"], body["endDate"], submitted, indexed)
        return
    label = " / ".join(dims)
    print(f"{'排名':>5} {'曝光':>7} {'點擊':>6} {'CTR':>6}  {label}")
    for r in rows:
        pos, imp, clk = r["position"], r["impressions"], r["clicks"]
        # 第 4-10 名 + 曝光破百 = 推一把就能進前三的 quick win
        mark = " ←推" if 4 <= pos <= 10 and imp >= 100 else ""
        print(f"{pos:5.1f} {imp:7d} {clk:6d} {r['ctr']*100:5.1f}%  {' / '.join(r['keys'])}{mark}")

    if a.record:
        record(rows, a.property, body["startDate"], body["endDate"], submitted, indexed)


if __name__ == "__main__":
    main()
