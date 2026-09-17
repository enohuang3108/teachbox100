import { decodeFor, encodeFor, isShareUnit } from "@/lib/share/units";
import { allowCreate, createShortLink } from "@/lib/short-link";
import { NextResponse } from "next/server";

// 40 題壓縮後約 2KB；翻牌放了照片的牌組才會超過，那種只給完整連結
const MAX_HASH = 64_000;

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
