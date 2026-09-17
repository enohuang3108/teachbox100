import { isShareUnit, sharePath } from "@/lib/share/units";
import { resolveShortLink } from "@/lib/short-link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = { robots: { index: false } };

export default async function ShortLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[A-Za-z0-9]{8}$/.test(id)) notFound();
  let link: Awaited<ReturnType<typeof resolveShortLink>>;
  try {
    link = await resolveShortLink(id);
  } catch (error) {
    // 連結可能還有效，只是 Redis 暫時連不上：別講成「找不到」
    console.error("[share] resolve failed", error);
    return <Unavailable />;
  }
  if (!link) notFound();
  // 到期資訊走 query，hash 維持原樣給 decodeSetup；單元頁讀完就清掉
  const [unit, hash] = link.target.split("#");
  if (!isShareUnit(unit)) notFound();
  const query = new URLSearchParams({ expires: String(link.expiresAt) });
  if (link.extended) query.set("extended", "1");
  redirect(`${sharePath(unit)}?${query}#${hash}`);
}

function Unavailable() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-h1 text-ink">短連結暫時打不開</h1>
      <p className="text-body-lg text-muted-foreground">
        請過幾分鐘再試一次，或請分享的人改傳「完整連結」。
      </p>
    </main>
  );
}
