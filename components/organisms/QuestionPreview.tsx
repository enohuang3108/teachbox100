"use client";

import {
  DIFFICULTIES,
  DIFFICULTY_LABEL,
  difficultyOf,
  type Difficulty,
  type Question,
} from "@/lib/questions/types";
import { cn } from "@/lib/utils";

// 難度點的顏色只給老師看（題目視窗不顯示），學生之間不會互相比較
export const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: "bg-success",
  normal: "bg-warning",
  hard: "bg-danger",
};

/** 設定頁的題庫摘要：題數、各難度幾題，展開看全部。出題的單元共用 */
export function QuestionPreview({ questions }: { questions: Question[] }) {
  const counts = DIFFICULTIES.map(
    (d) => [d, questions.filter((q) => difficultyOf(q) === d).length] as const,
  );
  return (
    <div className="rounded-2xl border border-border bg-background">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-dashed border-border px-4 py-3">
        <span className="text-sm font-semibold text-ink">
          共 {questions.length} 題
        </span>
        {counts.map(([d, n]) => (
          <span
            key={d}
            className="flex items-center gap-1.5 text-caption text-muted-foreground"
          >
            <span className={cn("size-2 rounded-full", DIFFICULTY_DOT[d])} />
            {DIFFICULTY_LABEL[d]} {n}
          </span>
        ))}
      </div>
      <details className="group px-4 py-3">
        <summary className="cursor-pointer text-caption text-muted-foreground">
          預覽題目
        </summary>
        <div className="mt-2 max-h-60 overflow-auto">
          <table className="w-full border-collapse text-caption">
            <tbody>
              {questions.map((q, i) => (
                <tr key={q.id} className="border-b border-border/50">
                  <td className="p-1 align-top text-muted-foreground">
                    {i + 1}
                  </td>
                  <td className="p-1 align-top">
                    <span
                      aria-label={DIFFICULTY_LABEL[difficultyOf(q)]}
                      className={cn(
                        "mt-1.5 inline-block size-2 rounded-full",
                        DIFFICULTY_DOT[difficultyOf(q)],
                      )}
                    />
                  </td>
                  <td className="p-1 align-top">
                    {q.text}
                    {q.options && (
                      <span className="text-muted-foreground">
                        {" "}
                        （{q.options.join("／")}）
                      </span>
                    )}
                  </td>
                  <td className="p-1 align-top text-muted-foreground">
                    {q.answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
