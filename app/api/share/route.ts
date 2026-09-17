import { decodeSetup, encodeSetup } from "@/lib/monopoly/share";
import {
  allowCreate,
  createShortLink,
  SHARE_UNITS,
  type ShareUnit,
} from "@/lib/short-link";
import { NextResponse } from "next/server";

// 40 題壓縮後約 2KB，64KB 足夠放上千題，再大就是亂打的
const MAX_HASH = 64_000;

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const body = (await req.json().catch(() => null)) as {
    unit?: string;
    hash?: string;
  } | null;
  const unit = body?.unit as ShareUnit;
  const hash = body?.hash;

  const setup =
    SHARE_UNITS.includes(unit) &&
    typeof hash === "string" &&
    hash.length <= MAX_HASH
      ? await decodeSetup(hash)
      : null;
  if (!setup) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  try {
    if (!(await allowCreate(ip))) {
      return NextResponse.json({ error: "rate limited" }, { status: 429 });
    }
    // 重新編碼成伺服器的版本，同一份設定才會得到同一個 id
    return NextResponse.json(
      await createShortLink(unit, await encodeSetup(setup)),
    );
  } catch (error) {
    // Redis 掛掉或額度用完：前端會退回完整連結
    console.error("[share] create failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
