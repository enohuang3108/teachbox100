// 把 sitemap 裡的網址全部提交給 IndexNow（Bing、Yandex、Naver 共用；ChatGPT 搜尋吃 Bing 索引）。
// 部署後跑一次：pnpm seo:indexnow
const SITE = "https://teachbox100.com";
const KEY = "8eac7771517c1a82d5dcf2c0aa4d8027"; // 對應 public/8eac7771517c1a82d5dcf2c0aa4d8027.txt，IndexNow 的 key 本來就是公開的

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key: KEY, urlList }),
});
console.log(res.status, res.statusText, `提交 ${urlList.length} 個網址`);
if (!res.ok) process.exit(1);
