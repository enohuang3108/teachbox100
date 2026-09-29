"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { OptionPills } from "@/components/molecules/OptionPills";
import { StepSetup } from "@/components/organisms/StepSetup";
import {
  MAX_DICE,
  MAX_FACE_LENGTH,
  MIN_DICE,
  validateFaces,
  type DiceMode,
} from "@/lib/dice/game";
import { useDiceStore } from "@/lib/dice/store";
import { Dices, PencilLine } from "lucide-react";

const COUNTS = Array.from(
  { length: MAX_DICE - MIN_DICE + 1 },
  (_, i) => MIN_DICE + i,
);

const MODES: { value: DiceMode; label: string; hint: string }[] = [
  { value: "number", label: "數字骰", hint: "一到六點，會算出總和" },
  { value: "text", label: "文字骰", hint: "六面寫上你要的活動或題目" },
];

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { count, mode, faces, setCount, setMode, setFace, restoreStarter } =
    useDiceStore();
  const error = mode === "text" ? validateFaces(faces) : undefined;

  return (
    <StepSetup
      title="骰子設定"
      blocker={error}
      startLabel="開始"
      share={{ unit: "dice", setup: { count, mode, faces } }}
      onStart={onStart}
      steps={[
        {
          key: "dice",
          label: "骰子",
          icon: Dices,
          summary: `${count} 顆・${mode === "number" ? "數字" : "文字"}`,
          content: (
            <section className="space-y-8">
              <div className="space-y-3">
                <header>
                  <h3 className="text-h3 text-ink">一次擲幾顆？</h3>
                  <DialogDescription className="mt-1">
                    大富翁、比大小用一到兩顆；練加法可以擲多一點。
                  </DialogDescription>
                </header>
                <OptionPills
                  name="dice-count"
                  value={count}
                  onChange={setCount}
                  options={COUNTS.map((n) => ({ value: n, label: `${n} 顆` }))}
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-h3 text-ink">骰面要寫什麼？</h3>
                <OptionPills
                  name="dice-mode"
                  value={mode}
                  onChange={setMode}
                  options={MODES.map((m) => ({ value: m.value, label: m.label }))}
                />
                <p className="text-caption text-muted-foreground">
                  {MODES.find((m) => m.value === mode)!.hint}
                </p>
              </div>
            </section>
          ),
        },
        {
          key: "faces",
          label: "骰面",
          icon: PencilLine,
          summary: mode === "number" ? "一到六點" : "六面文字",
          done: !error,
          content:
            mode === "number" ? (
              <section className="space-y-3">
                <h3 className="text-h3 text-ink">數字骰不用設定骰面</h3>
                <DialogDescription>
                  想讓骰面寫上「跳三下」「唱首歌」這類活動，回上一步改成文字骰。
                </DialogDescription>
              </section>
            ) : (
              <section className="space-y-5">
                <header>
                  <h3 className="text-h3 text-ink">六個面各寫什麼？</h3>
                  <DialogDescription className="mt-1">
                    每面最多 {MAX_FACE_LENGTH} 個字，投影時後排才看得清楚。幾顆骰子都用同一組骰面。
                  </DialogDescription>
                </header>
                <ol className="grid gap-3 sm:grid-cols-2">
                  {faces.map((face, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-12 shrink-0 text-caption text-muted-foreground">
                        第 {i + 1} 面
                      </span>
                      <input
                        aria-label={`第 ${i + 1} 面`}
                        value={face}
                        onChange={(e) => setFace(i, e.target.value)}
                        className="h-11 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-base text-ink focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      />
                    </li>
                  ))}
                </ol>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={restoreStarter}
                  className="text-muted-foreground hover:text-ink"
                >
                  恢復預設骰面
                </Button>
              </section>
            ),
        },
      ]}
    />
  );
}
