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
  newGroup,
  validateDeck,
  type PairGroup,
} from "@/lib/memory/game";
import { useMemoryStore } from "@/lib/memory/store";
import { cn } from "@/lib/utils";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useState } from "react";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { deck, setDeck, preview, setPreview, sound, setSound, restoreStarter } =
    useMemoryStore();
  const [confirmRestore, setConfirmRestore] = useState(false);
  const validation = validateDeck(deck);

  const patch = (i: number, p: Partial<PairGroup>) =>
    setDeck(deck.map((g, j) => (j === i ? { ...g, ...p } : g)));

  return (
    <div className="flex flex-col gap-6">
      <Reorder.Group
        axis="y"
        values={deck}
        onReorder={setDeck}
        className="flex flex-col gap-3"
      >
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
      </Reorder.Group>

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
        <label htmlFor="memory-sound" className="flex items-center justify-between gap-4">
          <span>
            <span className="text-ink block font-semibold">音效</span>
            <span className="text-muted-foreground text-sm">配對成功或失敗時播放</span>
          </span>
          <Switch id="memory-sound" checked={sound} onCheckedChange={setSound} />
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
  // 只有把手能拖，不然拖拉會跟輸入框搶指標
  const controls = useDragControls();
  const setFace = (k: 0 | 1, v: string) => {
    const faces: [string, string] = [...group.faces];
    faces[k] = v;
    onChange({ faces });
  };

  return (
    <Reorder.Item
      value={group}
      dragListener={false}
      dragControls={controls}
      className={cn(
        "bg-paper-warm border-ink/10 rounded-2xl border p-3",
        error && "border-brand-red/50",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`拖曳排序配對 ${index + 1}`}
          onPointerDown={(e) => controls.start(e)}
          className="text-ink-soft hover:text-ink cursor-grab touch-none rounded-md p-1 active:cursor-grabbing"
        >
          <GripVertical className="size-5" />
        </button>
        <span className="text-ink w-14 shrink-0 text-sm font-bold">配對 {index + 1}</span>
        <Input
          value={group.faces[0]}
          maxLength={MAX_FACE_LENGTH}
          placeholder="卡面 1"
          aria-label={`配對 ${index + 1} 卡面 1`}
          onChange={(e) => setFace(0, e.target.value)}
          className="bg-paper min-w-0 flex-1"
        />
        <Input
          value={group.sameFace ? group.faces[0] : group.faces[1]}
          maxLength={MAX_FACE_LENGTH}
          placeholder="卡面 2"
          aria-label={`配對 ${index + 1} 卡面 2`}
          disabled={group.sameFace}
          onChange={(e) => setFace(1, e.target.value)}
          className="bg-paper min-w-0 flex-1"
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
      <div className="mt-2 flex items-center justify-between gap-3 pl-9">
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
    </Reorder.Item>
  );
}
