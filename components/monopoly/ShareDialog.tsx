"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { encodeSetup, type SharedSetup } from "@/lib/monopoly/share";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

type Short =
  | { state: "loading" }
  | { state: "ok"; url: string; expiresAt: number }
  | { state: "failed"; reason: string };

/**
 * 按分享才掛載（`{open && <ShareDialog />}`）：掛載時編碼、建短連結，
 * 每次打開都是新的狀態，沒按分享就不佔 Redis 額度。
 */
export function ShareDialog({
  onClose,
  setup,
}: {
  onClose: () => void;
  setup: SharedSetup;
}) {
  const [long, setLong] = useState("");
  const [short, setShort] = useState<Short>({ state: "loading" });
  // 取打開那一刻的設定；視窗開著時設定不會變
  const [snapshot] = useState(setup);

  useEffect(() => {
    let alive = true;
    encodeSetup(snapshot).then(async (hash) => {
      if (!alive) return;
      setLong(`${location.origin}${location.pathname}#${hash}`);
      try {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ unit: "monopoly", hash }),
        });
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
            打開連結會帶入同樣的設定、玩家與題目。
          </DialogDescription>
        </DialogHeader>
        <LinkRow
          label="短連結"
          hint={
            short.state === "ok"
              ? `於 ${new Date(short.expiresAt).toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })} 失效`
              : "約 6 個月後失效"
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
