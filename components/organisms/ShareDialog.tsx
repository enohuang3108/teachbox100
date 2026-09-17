"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { SHARE_MAX_HASH } from "@/lib/share/codec";
import {
  encodeFor,
  prepareFor,
  sharePath,
  type SetupOf,
  type ShareUnit,
} from "@/lib/share/units";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// 會超過上限的只有翻牌照片（已先壓到最小一級），講具體原因老師才知道要改什麼
const tooLargeReason = (unit: ShareUnit) =>
  unit === "memory"
    ? "圖片過大，短連結放不下。請減少照片，或改用完整連結"
    : "內容過大，短連結放不下，請用完整連結";

const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

type Short =
  | { state: "loading" }
  | { state: "ok"; url: string; expiresAt: number }
  | { state: "failed"; reason: string };

export type ShareConfig = {
  [K in ShareUnit]: { unit: K; setup: SetupOf<K> };
}[ShareUnit];

/**
 * 按分享才掛載（`{open && <ShareDialog />}`）：掛載時編碼、建短連結，
 * 每次打開都是新的狀態，沒按分享就不佔 Redis 額度。
 */
export function ShareDialog({
  share,
  onClose,
}: {
  share: ShareConfig;
  onClose: () => void;
}) {
  const [long, setLong] = useState("");
  const [short, setShort] = useState<Short>({ state: "loading" });
  // 取打開那一刻的設定；視窗開著時設定不會變
  const [snapshot] = useState(share);

  useEffect(() => {
    let alive = true;
    const { unit, setup } = snapshot;
    prepareFor(unit, setup as never)
      .then((prepared) => encodeFor(unit, prepared))
      .then(async (hash) => {
        if (!alive) return;
        setLong(`${location.origin}${sharePath(unit)}#${hash}`);
        // 已知放不下就不打 API，省一次往返與次數額度
        if (hash.length > SHARE_MAX_HASH) {
          if (alive)
            setShort({ state: "failed", reason: tooLargeReason(unit) });
          return;
        }
        try {
          const res = await fetch("/api/share", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ unit, hash }),
          });
          if (res.status === 413) {
            if (alive)
              setShort({
                state: "failed",
                reason: tooLargeReason(unit),
              });
            return;
          }
          if (res.status === 429) {
            if (alive)
              setShort({
                state: "failed",
                reason: "分享太頻繁，請一分鐘後再試，或先用完整連結",
              });
            return;
          }
          if (!res.ok) throw new Error(String(res.status));
          const { id, expiresAt } = (await res.json()) as {
            id: string;
            expiresAt: number;
          };
          if (alive)
            setShort({
              state: "ok",
              url: `${location.origin}/s/${id}`,
              expiresAt,
            });
        } catch {
          // 離線或額度用完：完整連結照樣能用
          if (alive)
            setShort({ state: "failed", reason: "暫時無法產生，請用完整連結" });
        }
      });
    return () => {
      alive = false;
    };
  }, [snapshot]);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>分享設定</DialogTitle>
          <DialogDescription>
            打開連結會帶入同樣的設定，對方確認後就能開始。
          </DialogDescription>
        </DialogHeader>
        <LinkRow
          label="短連結"
          hint={
            short.state === "ok"
              ? `於 ${new Date(short.expiresAt).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })} 失效`
              : short.state === "loading"
                ? "約 6 個月後失效"
                : ""
          }
          value={
            short.state === "ok"
              ? short.url
              : short.state === "loading"
                ? null
                : undefined
          }
          error={short.state === "failed" ? short.reason : undefined}
        />
        <LinkRow
          label="完整連結"
          hint="連結不會失效，但比較長"
          value={long || null}
        />
      </DialogContent>
    </Dialog>
  );
}

/** value：null 產生中、undefined 產生失敗 */
function LinkRow({
  label,
  hint,
  value,
  error,
}: {
  label: string;
  hint: string;
  value: string | null | undefined;
  error?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="text-caption text-muted-foreground">{hint}</span>
      </div>
      <div className="flex gap-2">
        <input
          readOnly
          aria-label={label}
          value={value ?? (value === null ? "產生中…" : error)}
          onFocus={(e) => e.currentTarget.select()}
          className={cn(
            "h-10 min-w-0 flex-1 truncate rounded-xl bg-muted px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value ? "text-ink" : "text-muted-foreground",
          )}
        />
        <Button
          className={cn("w-20 shrink-0 rounded-full", PRESS)}
          disabled={!value}
          onClick={copy}
        >
          {copied ? "已複製" : "複製"}
        </Button>
      </div>
    </div>
  );
}
