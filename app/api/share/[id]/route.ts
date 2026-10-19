import { pages } from "@/app/pages.config";
import { decodeFor, isShareUnit } from "@/lib/share/units";
import { peekShortLink } from "@/lib/short-link";
import { NextResponse } from "next/server";

/** 首頁「使用分享連結」輸入代碼後，先讓老師看到是哪個遊戲、哪份題庫再打開 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[A-Za-z0-9]{8}$/.test(id)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  let target: string | null;
  try {
    target = await peekShortLink(id);
  } catch (error) {
    console.error("[share] peek failed", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  const [unit, hash = ""] = target?.split("#") ?? [];
  const setup = isShareUnit(unit) ? await decodeFor(unit, hash) : null;
  if (!setup) return NextResponse.json({ error: "not found" }, { status: 404 });

  // 出題遊戲的題目放在 bank（大富翁叫 questions），null 代表內建題庫
  const s = setup as { bank?: unknown; questions?: unknown; title?: string };
  const hasBank = "bank" in s || "questions" in s;
  const custom = s.bank ?? s.questions;
  return NextResponse.json({
    game: pages[unit as keyof typeof pages].title,
    ...(hasBank && { bank: custom ? s.title || "自訂題庫" : "內建題庫" }),
  });
}
