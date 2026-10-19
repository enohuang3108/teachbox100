"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/atoms/shadcn/button";
import { Checkbox } from "@/components/atoms/shadcn/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { Input } from "@/components/atoms/shadcn/input";
import { DIFFICULTIES, DIFFICULTY_LABEL, type Difficulty } from "@/lib/questions/types";
import { blankRow, rowErrors, toBank, toRows, type DraftRow } from "@/lib/questions/bank-draft";
import type { BankDraft } from "@/lib/questions/library";
import { cn } from "@/lib/utils";

const PRESS = "transition-transform duration-press ease-out active:scale-[0.97]";
const SELECT = "min-h-10 rounded-xl border border-border bg-card px-3 py-1.5 text-sm text-ink";
const LETTERS = ["A", "B", "C", "D"];

/**
 * 在瀏覽器裡編修一份題庫：改題目、勾選要出的題。open 時才掛載，關掉就丟掉草稿。
 * 題庫各遊戲共用：不收簡答的遊戲不提供新增簡答，但既有的簡答題照樣保留可改。
 */
export function BankEditor({
  initial,
  allowShort,
  onSave,
  onDelete,
  onClose,
}: {
  initial: BankDraft;
  allowShort: boolean;
  onSave: (draft: BankDraft) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [rows, setRows] = useState<DraftRow[]>(() => toRows(initial.questions, initial.off));
  const [tried, setTried] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const errors = rowErrors(rows);
  const titleError = !title.trim() ? "題庫名稱還沒填" : null;
  const used = rows.filter((r) => r.on).length;
  const allOn = rows.length > 0 && used === rows.length;

  const patch = (i: number, change: Partial<DraftRow>) =>
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...change } : r)));

  function save() {
    setTried(true);
    if (titleError || errors.some(Boolean) || used === 0) return;
    onSave({ id: initial.id, title: title.trim(), ...toBank(rows) });
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[min(860px,94dvh)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
        <header className="space-y-3 border-b border-border px-5 py-4 pr-12 md:px-8">
          <DialogTitle className="text-h3 text-ink">編輯題庫</DialogTitle>
          <DialogDescription className="sr-only">修改題目，勾選這次要出的題目</DialogDescription>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">題庫名稱</span>
            <Input value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} placeholder="例如：三年級自然・太陽" />
            {tried && titleError && <span className="text-caption text-danger-ink">{titleError}</span>}
          </label>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
              <Checkbox
                checked={allOn}
                onCheckedChange={(on) => setRows((rs) => rs.map((r) => ({ ...r, on: on === true })))}
                aria-label="全選"
              />
              使用 {used} / {rows.length} 題
            </label>
            {tried && used === 0 && <span className="text-caption text-danger-ink">至少勾選一題</span>}
          </div>
        </header>

        <ol className="min-h-0 space-y-3 overflow-y-auto bg-muted/40 px-5 py-4 md:px-8">
          {rows.map((r, i) => (
            <li
              key={r.id}
              aria-label={`第 ${i + 1} 題`}
              className={cn(
                "space-y-3 rounded-2xl border bg-card p-4 transition-opacity duration-hover",
                tried && errors[i] ? "border-danger" : "border-border",
                !r.on && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                  <Checkbox checked={r.on} onCheckedChange={(on) => patch(i, { on: on === true })} aria-label={`使用第 ${i + 1} 題`} />
                  第 {i + 1} 題
                </label>
                <select
                  aria-label={`第 ${i + 1} 題題型`}
                  value={r.type}
                  onChange={(e) => {
                    const type = e.target.value as DraftRow["type"];
                    patch(i, { type, answer: type === "choice" ? "0" : type === "boolean" ? "是" : "" });
                  }}
                  className={SELECT}
                >
                  <option value="choice">選擇</option>
                  <option value="boolean">是非</option>
                  {(allowShort || r.type === "short") && <option value="short">簡答</option>}
                </select>
                <select
                  aria-label={`第 ${i + 1} 題難度`}
                  value={r.difficulty}
                  onChange={(e) => patch(i, { difficulty: e.target.value as Difficulty })}
                  className={SELECT}
                >
                  {DIFFICULTIES.map((d) => <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>)}
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("ml-auto rounded-full text-muted-foreground", PRESS)}
                  aria-label={`刪除第 ${i + 1} 題`}
                  onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
              <Input
                aria-label={`第 ${i + 1} 題題目`}
                value={r.text}
                onChange={(e) => patch(i, { text: e.target.value })}
                placeholder="題目"
              />
              {r.type === "choice" ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {r.options.map((o, k) => (
                    <label key={k} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`answer-${r.id}`}
                        aria-label={`第 ${i + 1} 題正確答案 ${LETTERS[k]}`}
                        checked={r.answer === String(k)}
                        onChange={() => patch(i, { answer: String(k) })}
                        className="size-4 accent-primary dark:[color-scheme:dark]"
                      />
                      <Input
                        aria-label={`第 ${i + 1} 題選項 ${LETTERS[k]}`}
                        value={o}
                        onChange={(e) => patch(i, { options: r.options.map((x, j) => (j === k ? e.target.value : x)) })}
                        placeholder={`選項 ${LETTERS[k]}`}
                      />
                    </label>
                  ))}
                  <p className="text-caption text-muted-foreground sm:col-span-2">圓點選的是正確答案</p>
                </div>
              ) : r.type === "short" ? (
                <Input
                  aria-label={`第 ${i + 1} 題答案`}
                  value={r.answer}
                  onChange={(e) => patch(i, { answer: e.target.value })}
                  placeholder="答案"
                />
              ) : (
                <div className="flex gap-4" role="radiogroup" aria-label={`第 ${i + 1} 題正確答案`}>
                  {["是", "否"].map((a) => (
                    <label key={a} className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                      <input
                        type="radio"
                        name={`answer-${r.id}`}
                        checked={r.answer === a}
                        onChange={() => patch(i, { answer: a })}
                        className="size-4 accent-primary dark:[color-scheme:dark]"
                      />
                      {a}
                    </label>
                  ))}
                </div>
              )}
              {tried && errors[i] && <p role="alert" className="text-caption text-danger-ink">{errors[i]}</p>}
            </li>
          ))}
          <li>
            <Button variant="outline" className={cn("w-full rounded-2xl border-dashed", PRESS)} onClick={() => setRows((rs) => [...rs, blankRow()])}>
              <Plus className="size-4" aria-hidden />
              新增題目
            </Button>
          </li>
        </ol>

        <footer className="flex flex-wrap items-center gap-2 border-t border-border bg-card px-5 py-3 md:px-8">
          {onDelete && (
            <Button
              variant="ghost"
              className={cn("rounded-full text-danger-ink", PRESS)}
              onClick={() => (confirmDelete ? onDelete() : setConfirmDelete(true))}
            >
              {confirmDelete ? "再按一次確定刪除" : "刪除這份題庫"}
            </Button>
          )}
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" className={cn("rounded-full", PRESS)} onClick={onClose}>取消</Button>
            <Button className={cn("rounded-full px-6 font-bold", PRESS)} onClick={save}>儲存</Button>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
