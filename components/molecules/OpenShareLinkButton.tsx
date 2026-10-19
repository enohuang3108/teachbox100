"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { shareCodeFrom } from "@/lib/share/short-code";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const PRESS =
  "transition-transform duration-press ease-out active:scale-[0.97]";

type Preview =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "ok"; game: string; bank?: string }
  | { state: "failed"; reason: string };

export function OpenShareLinkButton({
  className,
  label,
}: {
  className: string;
  label: React.ReactNode;
}) {
  const [input, setInput] = useState("");
  // 查詢結果記著是哪個代碼的：代碼一改，舊結果自然變回「查詢中」
  const [result, setResult] = useState<{ code: string; preview: Preview }>();
  const code = shareCodeFrom(input);
  const preview: Preview = !code
    ? { state: "idle" }
    : result?.code === code
      ? result.preview
      : { state: "loading" };

  useEffect(() => {
    if (!code) return;
    let alive = true;
    const settle = (preview: Preview) => alive && setResult({ code, preview });
    fetch(`/api/share/${code}`)
      .then(async (res) => {
        if (res.status === 404) {
          settle({
            state: "failed",
            reason: "找不到這個連結，請確認英文大小寫，或連結可能已過期",
          });
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        settle({ state: "ok", ...(await res.json()) });
      })
      .catch(() => settle({ state: "failed", reason: "暫時查不到，請稍後再試" }));
    return () => {
      alive = false;
    };
  }, [code]);

  return (
    <Dialog>
      <DialogTrigger className={className}>{label}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>使用分享連結</DialogTitle>
          <DialogDescription>
            輸入短連結 s/ 後面的 8 碼，英文大小寫要一樣。
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (preview.state === "ok") location.assign(`/s/${code}`);
          }}
        >
          <label className="flex h-11 items-center rounded-xl bg-muted px-3 focus-within:ring-2 focus-within:ring-ring">
            <span className="text-sm text-muted-foreground">s/</span>
            <input
              aria-label="分享代碼"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如 abcdEFGH"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-full min-w-0 flex-1 bg-transparent pl-0.5 font-mono text-base text-ink outline-none placeholder:font-sans placeholder:text-muted-foreground"
            />
          </label>
          <div aria-live="polite" className="text-sm empty:hidden">
            {preview.state === "loading" && (
              <p className="text-muted-foreground">查詢中…</p>
            )}
            {preview.state === "failed" && (
              <p className="text-danger-ink">{preview.reason}</p>
            )}
            {preview.state === "ok" && (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">遊戲</dt>
                <dd className="font-semibold text-ink">{preview.game}</dd>
                {preview.bank && (
                  <>
                    <dt className="text-muted-foreground">題庫</dt>
                    <dd className="truncate font-semibold text-ink">
                      {preview.bank}
                    </dd>
                  </>
                )}
              </dl>
            )}
          </div>
          <Button
            type="submit"
            className={cn("w-full rounded-full", PRESS)}
            disabled={preview.state !== "ok"}
          >
            開啟
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
