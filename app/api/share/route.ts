import { decodeFor, encodeFor, isShareUnit } from "@/lib/share/units";
import { allowCreate, createShortLink } from "@/lib/short-link";
import { NextResponse } from "next/server";

// 文字設定都只有幾 KB（大富翁 40 題約 2KB）；會用到這麼大的只有翻牌的照片，
// 分享前已壓到 lib/memory/share.ts 的 SHARE_IMAGE_BUDGET 以內
const MAX_HASH = 256_000;

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const body = (await req.json().catch(() => null)) as {
    unit?: unknown;
    hash?: unknown;
  } | null;
  const { unit, hash } = body ?? {};

  if (!isShareUnit(unit) || typeof hash !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  if (hash.length > MAX_HASH) {
    return NextResponse.json({ error: "too large" }, { status: 413 });
  }
  const setup = await decodeFor(unit, hash);
  if (!setup) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    if (!(await allowCreate(ip))) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }
    // 重新編碼成伺服器的版本，同一份設定才會得到同一個 id
    return NextResponse.json(
      await createShortLink(unit, await encodeFor(unit, setup)),
    );
  } catch (error) {
    // Redis 掛掉或額度用完：前端會退回完整連結
    console.error("[share] create failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
