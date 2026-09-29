"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { Switch } from "@/components/atoms/shadcn/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/atoms/shadcn/tabs";
import { OptionPills } from "@/components/molecules/OptionPills";
import { StepSetup } from "@/components/organisms/StepSetup";
import {
  MAX_GROUPS,
  MAX_PLAYERS,
  MAX_RESULT_LENGTH,
  MIN_GROUPS,
  parseNames,
  parseResults,
  validateSetup,
  type LadderMode,
} from "@/lib/ladder/game";
import { useLadderStore } from "@/lib/ladder/store";
import { Flag, ListOrdered, SlidersHorizontal } from "lucide-react";

const TEXTAREA =
  "w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-base leading-[1.75] text-ink placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const store = useLadderStore();
  const { names, mode, results, groupCount, hideResults } = store;
  const nameList = parseNames(names);
  const resultList = parseResults(results);
  const error = validateSetup(nameList, {
    mode,
    results: resultList,
    groupCount,
  });
  const groupOptions = Array.from(
    { length: MAX_GROUPS - MIN_GROUPS + 1 },
    (_, i) => MIN_GROUPS + i,
  ).map((n) => ({ value: n, label: `${n} 組` }));

  return (
    <StepSetup
      title="爬格子設定"
      blocker={error}
      startLabel="開始"
      share={{
        unit: "ladder",
        setup: { names, mode, results, groupCount, hideResults },
      }}
      onStart={onStart}
      steps={[
        {
          key: "names",
          label: "名單",
          icon: ListOrdered,
          summary: `${nameList.length} 人`,
          content: (
            <section className="space-y-5">
              <header className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-h3 text-ink">誰要爬格子？</h3>
                  <DialogDescription className="mt-1">
                    一行一個，名字會排在格子最上面。
                  </DialogDescription>
                </div>
                <span className="shrink-0 text-caption text-muted-foreground">
                  {nameList.length}／{MAX_PLAYERS}
                </span>
              </header>
              <textarea
                aria-label="名單，一行一個"
                value={names}
                rows={10}
                spellCheck={false}
                placeholder={"小明\n小華\n小美"}
                onChange={(e) => store.setNames(e.target.value)}
                className={TEXTAREA}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={store.restoreStarter}
                className="text-muted-foreground hover:text-ink"
              >
                恢復預設名單
              </Button>
            </section>
          ),
        },
        {
          key: "results",
          label: "結果",
          icon: Flag,
          summary: mode === "groups" ? `分 ${groupCount} 組` : `${resultList.length} 個結果`,
          done: !error,
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">最下面要放什麼？</h3>
                <DialogDescription className="mt-1">
                  爬到底停在哪一格，就是那個人的結果。
                </DialogDescription>
              </header>
              <Tabs
                value={mode}
                onValueChange={(v) => store.setMode(v as LadderMode)}
                className="gap-4"
              >
                <TabsList aria-label="結果種類">
                  <TabsTrigger value="custom" className="px-4">
                    自訂結果
                  </TabsTrigger>
                  <TabsTrigger value="groups" className="px-4">
                    分組
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="custom" className="space-y-3">
                  <p className="text-caption text-muted-foreground">
                    一行一個，數量要跟名單一樣多（{nameList.length} 個），每個最多{" "}
                    {MAX_RESULT_LENGTH} 字。打掃工作、獎品、題號都可以。
                  </p>
                  <textarea
                    aria-label="結果，一行一個"
                    value={results}
                    rows={8}
                    spellCheck={false}
                    onChange={(e) => store.setResults(e.target.value)}
                    className={TEXTAREA}
                  />
                </TabsContent>
                <TabsContent value="groups" className="space-y-3">
                  <p className="text-caption text-muted-foreground">
                    最底下自動放好組別，各組人數最多差一人。
                  </p>
                  <OptionPills
                    name="ladder-groups"
                    value={groupCount}
                    options={groupOptions}
                    onChange={store.setGroupCount}
                  />
                </TabsContent>
              </Tabs>
            </section>
          ),
        },
        {
          key: "rules",
          label: "玩法",
          icon: SlidersHorizontal,
          summary: hideResults ? "結果先蓋起來" : "結果先打開",
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">結果要先讓大家看到嗎？</h3>
                <DialogDescription className="mt-1">
                  蓋起來比較有懸念；打開可以讓大家先知道有哪些選項。
                </DialogDescription>
              </header>
              <label
                htmlFor="ladder-hide"
                className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    結果先蓋起來
                  </span>
                  <span className="mt-0.5 block text-caption text-muted-foreground">
                    爬到底才打開那一格。
                  </span>
                </span>
                <Switch
                  id="ladder-hide"
                  checked={hideResults}
                  onCheckedChange={store.setHideResults}
                  className="mt-0.5"
                />
              </label>
            </section>
          ),
        },
      ]}
    />
  );
}
