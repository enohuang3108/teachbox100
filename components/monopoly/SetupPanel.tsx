"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { Input } from "@/components/atoms/shadcn/input";
import { Label } from "@/components/atoms/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/shadcn/select";
import { buildTemplateBlob, parseQuestions, rowsFromFile } from "@/lib/monopoly/excel";
import { useMonopolyStore } from "@/lib/monopoly/store";
import { PLAYER_COLORS, type EndCondition } from "@/lib/monopoly/types";
import { useState } from "react";

export function SetupPanel() {
  const {
    draftSettings,
    draftQuestions,
    draftPlayers,
    importQuestions,
    updateSettings,
    setPlayers,
    begin,
  } = useMonopolyStore();
  const [errors, setErrors] = useState<string[]>([]);

  const playerCount = draftSettings.playerCount;

  function syncPlayers(count: number) {
    const next = Array.from(
      { length: count },
      (_, i) =>
        draftPlayers[i] ?? {
          name: `玩家${i + 1}`,
          color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        },
    );
    setPlayers(next);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrors([]);
    try {
      const rows = await rowsFromFile(file);
      const result = parseQuestions(rows);
      if (result.ok) {
        importQuestions(result.questions);
      } else {
        setErrors(result.errors.map((er) => `第 ${er.row} 列：${er.message}`));
        importQuestions([]);
      }
    } catch {
      setErrors(["檔案讀取失敗，請確認為 .xlsx 格式"]);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(buildTemplateBlob());
    const a = document.createElement("a");
    a.href = url;
    a.download = "大富翁題庫範本.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  const canStart = draftQuestions.length > 0 && playerCount >= 2;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">大富翁 — 遊戲設定</h1>

      {/* 題庫匯入 */}
      <section className="space-y-2 rounded-lg border p-4">
        <Label className="text-lg">題庫匯入</Label>
        <div className="flex items-center gap-3">
          <Input type="file" accept=".xlsx,.xls" onChange={onFile} />
          <Button variant="outline" onClick={downloadTemplate}>
            下載範本
          </Button>
        </div>
        {draftQuestions.length > 0 && (
          <p className="text-sm text-green-600">已載入 {draftQuestions.length} 題</p>
        )}
        {errors.length > 0 && (
          <ul className="max-h-40 overflow-y-auto text-sm text-red-600">
            {errors.map((er, i) => (
              <li key={i}>{er}</li>
            ))}
          </ul>
        )}
      </section>

      {/* 玩家設定 */}
      <section className="space-y-2 rounded-lg border p-4">
        <Label className="text-lg">人數（2–20）</Label>
        <Input
          type="number"
          min={2}
          max={20}
          value={playerCount}
          onChange={(e) => {
            const n = Math.min(20, Math.max(2, Number(e.target.value) || 2));
            updateSettings({ playerCount: n });
            syncPlayers(n);
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: playerCount }, (_, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: PLAYER_COLORS[i % PLAYER_COLORS.length] }}
              />
              <Input
                value={draftPlayers[i]?.name ?? `玩家${i + 1}`}
                onChange={(e) => {
                  const next = [...draftPlayers];
                  next[i] = {
                    name: e.target.value,
                    color: PLAYER_COLORS[i % PLAYER_COLORS.length],
                  };
                  setPlayers(next);
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 規則設定 */}
      <section className="grid grid-cols-2 gap-4 rounded-lg border p-4">
        <div>
          <Label>起始金額</Label>
          <Input
            type="number"
            value={draftSettings.startingMoney}
            onChange={(e) =>
              updateSettings({ startingMoney: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label>骰子數量</Label>
          <Select
            value={String(draftSettings.diceCount)}
            onValueChange={(v) => updateSettings({ diceCount: Number(v) as 1 | 2 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 顆</SelectItem>
              <SelectItem value="2">2 顆</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>經過起點獎勵</Label>
          <Input
            type="number"
            value={draftSettings.passStartBonus}
            onChange={(e) =>
              updateSettings({ passStartBonus: Number(e.target.value) || 0 })
            }
          />
        </div>
        <div>
          <Label>結束條件</Label>
          <Select
            value={draftSettings.endCondition.type}
            onValueChange={(v) => {
              const map: Record<string, EndCondition> = {
                time: { type: "time", minutes: 40 },
                moneyGoal: { type: "moneyGoal", amount: 50000 },
                lastOneStanding: { type: "lastOneStanding" },
                laps: { type: "laps", count: 3 },
              };
              updateSettings({ endCondition: map[v] });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="time">時間到</SelectItem>
              <SelectItem value="moneyGoal">金額達標</SelectItem>
              <SelectItem value="lastOneStanding">最後存活者</SelectItem>
              <SelectItem value="laps">完成圈數</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <Button className="w-full" size="lg" disabled={!canStart} onClick={begin}>
        開始遊戲
      </Button>
      {!canStart && (
        <p className="text-center text-sm text-muted-foreground">
          需先匯入題庫並設定至少 2 位玩家
        </p>
      )}
    </div>
  );
}
