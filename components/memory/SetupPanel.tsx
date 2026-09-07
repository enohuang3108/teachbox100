"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import { Switch } from "@/components/atoms/shadcn/switch";
import {
  MAX_FACE_LENGTH,
  MAX_GROUPS,
  MIN_GROUPS,
  isImageFace,
  newGroup,
  validateDeck,
  type PairGroup,
} from "@/lib/memory/game";
import { fileToFace } from "@/lib/memory/image";
import { useMemoryStore } from "@/lib/memory/store";
import { cn } from "@/lib/utils";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { deck, setDeck, preview, setPreview, restoreStarter } = useMemoryStore();
  const [confirmRestore, setConfirmRestore] = useState(false);
  const validation = validateDeck(deck);

  const patch = (i: number, p: Partial<PairGroup>) =>
    setDeck(deck.map((g, j) => (j === i ? { ...g, ...p } : g)));

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {deck.map((g, i) => (
          <GroupRow
            key={g.id}
            group={g}
            index={i}
            error={validation.groups[i]}
            canRemove={deck.length > MIN_GROUPS}
            onChange={(p) => patch(i, p)}
            onRemove={() => setDeck(deck.filter((_, j) => j !== i))}
          />
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          disabled={deck.length >= MAX_GROUPS}
          onClick={() => setDeck([...deck, newGroup()])}
        >
          <Plus /> 新增配對
        </Button>
        <span className="text-muted-foreground text-sm">
          {deck.length} / {MAX_GROUPS} 組
        </span>
        <Button
          variant="ghost"
          className="ml-auto"
          onClick={() => setConfirmRestore(true)}
        >
          恢復預設牌組
        </Button>
      </div>

      <div className="bg-paper-warm border-ink/10 flex flex-col gap-4 rounded-2xl border p-4">
        <label htmlFor="memory-preview" className="flex items-center justify-between gap-4">
          <span>
            <span className="text-ink block font-semibold">開局先看牌</span>
            <span className="text-muted-foreground text-sm">
              開始時全部翻開 2 秒再蓋回去
            </span>
          </span>
          <Switch id="memory-preview" checked={preview} onCheckedChange={setPreview} />
        </label>
      </div>

      {validation.deck && (
        <p className="text-brand-red text-sm font-medium">{validation.deck}</p>
      )}
      <Button size="lg" disabled={!validation.ok} onClick={onStart}>
        開始遊戲
      </Button>

      <Dialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>恢復預設牌組？</DialogTitle>
            <DialogDescription>
              目前的 {deck.length} 組配對會被貓、狗、太陽、月亮四組取代。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmRestore(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                restoreStarter();
                setConfirmRestore(false);
              }}
            >
              恢復預設
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupRow({
  group,
  index,
  error,
  canRemove,
  onChange,
  onRemove,
}: {
  group: PairGroup;
  index: number;
  error?: string;
  canRemove: boolean;
  onChange: (p: Partial<PairGroup>) => void;
  onRemove: () => void;
}) {
  const setFace = (k: 0 | 1, v: string) => {
    const faces: [string, string] = [...group.faces];
    faces[k] = v;
    onChange({ faces });
  };

  return (
    <li
      className={cn(
        "bg-paper-warm border-ink/10 rounded-2xl border p-3",
        error && "border-brand-red/50",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-ink w-14 shrink-0 text-sm font-bold">配對 {index + 1}</span>
        <FaceInput
          label={`配對 ${index + 1} 卡面 1`}
          placeholder="卡面 1"
          value={group.faces[0]}
          onChange={(v) => setFace(0, v)}
        />
        <FaceInput
          label={`配對 ${index + 1} 卡面 2`}
          placeholder="卡面 2"
          value={group.sameFace ? group.faces[0] : group.faces[1]}
          disabled={group.sameFace}
          onChange={(v) => setFace(1, v)}
        />
        <button
          type="button"
          aria-label={`刪除配對 ${index + 1}`}
          disabled={!canRemove}
          onClick={onRemove}
          className="text-ink-soft hover:text-brand-red rounded-md p-1 disabled:opacity-30"
        >
          <Trash2 className="size-5" />
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 pl-16">
        <label htmlFor={`same-${group.id}`} className="text-muted-foreground flex items-center gap-2 text-sm">
          <Switch
            id={`same-${group.id}`}
            checked={group.sameFace}
            onCheckedChange={(sameFace) => onChange({ sameFace })}
            className="scale-90"
          />
          同卡面
        </label>
        {error && <span className="text-brand-red text-sm">{error}</span>}
      </div>
    </li>
  );
}

/** 一個卡面：文字輸入框加一顆「換成圖片」；已是圖片就顯示縮圖加一顆「清掉」 */
function FaceInput({
  label,
  placeholder,
  value,
  disabled,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const [failed, setFailed] = useState(false);
  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      onChange(await fileToFace(file));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };

  if (isImageFace(value)) {
    return (
      <div className="bg-paper border-ink/10 relative flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border px-2">
        {/* 縮圖已是 data URL，不走 next/image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt={label} className="h-7 w-7 rounded object-cover" />
        <span className="text-muted-foreground truncate text-sm">圖片</span>
        {!disabled && (
          <button
            type="button"
            aria-label={`${label} 清除圖片`}
            onClick={() => onChange("")}
            className="text-ink-soft hover:text-ink ml-auto rounded-md p-1"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <Input
        value={value}
        maxLength={MAX_FACE_LENGTH}
        placeholder={placeholder}
        aria-label={label}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn("bg-paper min-w-0 flex-1", failed && "border-brand-red/50")}
      />
      {!disabled && (
        <label
          aria-label={`${label} 改用圖片`}
          title="改用圖片"
          className="text-ink-soft hover:text-ink cursor-pointer rounded-md p-1"
        >
          <ImagePlus className="size-5" />
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void pick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}
    </div>
  );
}
