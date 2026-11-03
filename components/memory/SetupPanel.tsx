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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/atoms/shadcn/radio-group";
import { Switch } from "@/components/atoms/shadcn/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/shadcn/tabs";
import { StepSetup } from "@/components/organisms/StepSetup";
import {
  AI_DECK_PROMPT,
  effectiveFaces,
  MAX_FACE_LENGTH,
  MAX_GROUPS,
  MIN_GROUPS,
  isImageFace,
  newGroup,
  parseBatch,
  toBatch,
  validateDeck,
  type PairGroup,
} from "@/lib/memory/game";
import { fileToFace } from "@/lib/memory/image";
import { useMemoryStore } from "@/lib/memory/store";
import { SELECTED_OPTION } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  ImagePlus,
  Layers,
  Palette,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { CARD_BACKS, CardBack, findBack } from "./CardBack";

const TEXTAREA =
  "w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-base leading-[1.75] text-ink placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

const hasImage = (g: PairGroup) => effectiveFaces(g).some(isImageFace);

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { deck, setDeck, preview, setPreview, back, setBack, restoreStarter } =
    useMemoryStore();
  const [confirmRestore, setConfirmRestore] = useState(false);
  const validation = validateDeck(deck);

  // 批次輸入編的是一份草稿文字，牌組每打一個字就跟著重算；
  // 圖片組放不進文字，原封不動接在後面，切回一般輸入還在
  const [mode, setMode] = useState("list");
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const images = deck.filter(hasImage);
  const switchMode = (next: string) => {
    if (next === "batch") setDraft(toBatch(deck.filter((g) => !hasImage(g))));
    setMode(next);
  };
  const editDraft = (text: string) => {
    setDraft(text);
    setDeck([...parseBatch(text), ...images]);
  };
  // 錯誤指到草稿的第幾行（空行不算一組）
  const lineNos = draft
    .split("\n")
    .flatMap((line, i) => (line.trim() ? [i + 1] : []));
  const draftErrors = validation.groups.flatMap((e, i) =>
    e && i < lineNos.length ? [`第 ${lineNos[i]} 行：${e}`] : [],
  );
  const copyPrompt = () =>
    navigator.clipboard
      .writeText(AI_DECK_PROMPT)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});

  const patch = (i: number, p: Partial<PairGroup>) =>
    setDeck(deck.map((g, j) => (j === i ? { ...g, ...p } : g)));

  const blocker = validation.ok
    ? null
    : (validation.deck ??
      (mode === "batch"
        ? "有配對還沒填好，請看紅字那一行"
        : "有配對還沒填好，請看紅字那一組"));

  return (
    <>
      <StepSetup
        title="翻翻配對設定"
        blocker={blocker}
        startLabel="開始遊戲"
        share={{ unit: "memory", setup: { deck, preview } }}
        onStart={onStart}
        steps={[
          {
            key: "deck",
            label: "牌組",
            icon: Layers,
            summary: `${deck.length} 組`,
            done: validation.ok,
            content: (
              <section className="space-y-5">
                <header className="flex items-end justify-between gap-3">
                  <div>
                    <h3 className="text-h3 text-ink">要配對哪些牌？</h3>
                    <DialogDescription className="mt-1">
                      每組兩張卡面，可以是文字或圖片；打開「同卡面」就是兩張一樣。
                      題目多可以用批次輸入一次貼上。
                    </DialogDescription>
                  </div>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {deck.length}／{MAX_GROUPS} 組
                  </span>
                </header>
                <Tabs value={mode} onValueChange={switchMode} className="gap-4">
                  <TabsList aria-label="輸入方式">
                    <TabsTrigger value="list" className="px-4">
                      一般輸入
                    </TabsTrigger>
                    <TabsTrigger value="batch" className="px-4">
                      批次輸入
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="list" className="space-y-5">
                    <ul className="flex flex-col gap-3">
                      {deck.map((g, i) => (
                        <GroupRow
                          key={g.id}
                          group={g}
                          index={i}
                          error={validation.groups[i]}
                          canRemove={deck.length > MIN_GROUPS}
                          onChange={(p) => patch(i, p)}
                          onRemove={() =>
                            setDeck(deck.filter((_, j) => j !== i))
                          }
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto text-muted-foreground hover:text-ink"
                        onClick={() => setConfirmRestore(true)}
                      >
                        恢復預設牌組
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="batch" className="space-y-3">
                    <p className="text-caption text-muted-foreground">
                      一行一組，卡面 1 和卡面 2
                      中間空一格；只寫一個就是兩張一樣。
                      這裡不能放圖片，要用圖片就先打好文字，再切回一般輸入換成圖片。
                    </p>
                    <textarea
                      aria-label="批次輸入，一行一組"
                      value={draft}
                      rows={10}
                      spellCheck={false}
                      placeholder={"貓 cat\n狗 dog\n太陽 sun"}
                      onChange={(e) => editDraft(e.target.value)}
                      className={cn(
                        TEXTAREA,
                        draftErrors.length > 0 && "border-brand-red/50",
                      )}
                    />
                    {draftErrors.length > 0 && (
                      <ul className="text-brand-red space-y-0.5 text-sm">
                        {draftErrors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    )}
                    {images.length > 0 && (
                      <p className="text-caption text-muted-foreground">
                        另有 {images.length}{" "}
                        組圖片配對沒列在這裡，會一起上場；切回一般輸入可以看到。
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      <Button variant="outline" size="sm" onClick={copyPrompt}>
                        {copied ? <Check /> : <Copy />}
                        {copied ? "已複製提示詞" : "複製 AI 出題提示詞"}
                      </Button>
                      <span className="text-caption text-muted-foreground">
                        貼給 AI、補上主題，再把它回的文字貼進上面。
                      </span>
                    </div>
                  </TabsContent>
                </Tabs>
              </section>
            ),
          },
          {
            key: "rules",
            label: "玩法",
            icon: SlidersHorizontal,
            summary: preview ? "開局先看牌" : "直接開始",
            content: (
              <section className="space-y-5">
                <header>
                  <h3 className="text-h3 text-ink">開局要先讓學生看一眼嗎？</h3>
                  <DialogDescription className="mt-1">
                    年紀小或牌多時先看牌比較容易上手。
                  </DialogDescription>
                </header>
                <label
                  htmlFor="memory-preview"
                  className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3.5"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">
                      開局先看牌
                    </span>
                    <span className="mt-0.5 block text-caption text-muted-foreground">
                      開始時全部翻開 2 秒再蓋回去
                    </span>
                  </span>
                  <Switch
                    id="memory-preview"
                    checked={preview}
                    onCheckedChange={setPreview}
                    className="mt-0.5"
                  />
                </label>
              </section>
            ),
          },
          {
            key: "back",
            label: "卡背",
            icon: Palette,
            summary: findBack(back).label,
            content: (
              <section className="space-y-5">
                <header>
                  <h3 className="text-h3 text-ink">卡背要長什麼樣？</h3>
                  <DialogDescription className="mt-1">
                    蓋著的牌全班都看得到這一面。
                  </DialogDescription>
                </header>
                <RadioGroup
                  value={findBack(back).id}
                  onValueChange={setBack}
                  aria-label="卡背"
                  className="grid grid-cols-3 gap-3 sm:grid-cols-4"
                >
                  {CARD_BACKS.map((b) => (
                    <label
                      key={b.id}
                      htmlFor={`memory-back-${b.id}`}
                      className="group"
                    >
                      <span
                        className={cn(
                          "flex cursor-pointer flex-col gap-2 rounded-2xl border p-2 transition-colors duration-hover",
                          SELECTED_OPTION,
                        )}
                      >
                        <span className="aspect-[3/4] overflow-hidden rounded-xl">
                          <CardBack id={b.id} />
                        </span>
                        <span className="flex items-center gap-2 px-1 text-sm font-medium">
                          <RadioGroupItem
                            value={b.id}
                            id={`memory-back-${b.id}`}
                          />
                          {b.label}
                        </span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </section>
            ),
          },
        ]}
      />

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
    </>
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
        <span className="text-ink w-14 shrink-0 text-sm font-bold">
          配對 {index + 1}
        </span>
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
        <Button
          variant="ghost"
          size="icon"
          aria-label={`刪除配對 ${index + 1}`}
          disabled={!canRemove}
          onClick={onRemove}
          className="text-ink-soft hover:text-brand-red size-9 disabled:opacity-30"
        >
          <Trash2 className="size-5" />
        </Button>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 pl-16">
        <label
          htmlFor={`same-${group.id}`}
          className="text-muted-foreground flex items-center gap-2 text-sm"
        >
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
          <Button
            variant="ghost"
            size="icon"
            aria-label={`${label} 清除圖片`}
            onClick={() => onChange("")}
            className="text-ink-soft hover:text-ink ml-auto size-7"
          >
            <X className="size-4" />
          </Button>
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
        className={cn(
          "bg-paper min-w-0 flex-1",
          failed && "border-brand-red/50",
        )}
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
