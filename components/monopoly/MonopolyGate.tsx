"use client";

import { pages, siblingsOf } from "@/app/pages.config";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { PageTitleBar } from "@/components/molecules/PageTitleBar";
import { UnitHero } from "@/components/organisms/UnitHero";
import { getBreadcrumbTrail } from "@/lib/jsonld";
import { preloadMonopoly } from "@/lib/monopoly/preload";
import { useMonopolyStore } from "@/lib/monopoly/store";
import { useEffect, useState } from "react";
import { SetupPanel } from "./SetupPanel";

const page = pages.monopoly;

/**
 * 沒有進行中的局面時只給介紹頁（SSR 出來給爬蟲讀），按「開始遊戲」才開設定；
 * 開局後整頁只剩遊戲，說明與 FAQ 不再跟著渲染。
 */
export function MonopolyGate({
  intro,
  seo,
  children,
}: {
  intro: string;
  seo: React.ReactNode;
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const inGame = useMonopolyStore(
    (s) => s.game !== null && s.game.phase !== "setup",
  );
  const [entered, setEntered] = useState(false);

  // persist 要到 client 才讀得到；hydrate 前一律當成沒開局，server HTML 才有介紹頁
  if (hydrated && inGame) return children;

  const titleBar = (
    <PageTitleBar
      trail={getBreadcrumbTrail("monopoly")}
      siblings={siblingsOf("monopoly")}
    />
  );

  // 進場後介紹頁整個讓位，只剩設定；關掉設定回介紹頁
  if (entered) {
    return (
      <>
        {titleBar}
        <Dialog open onOpenChange={(open) => !open && setEntered(false)}>
          <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
            <SetupPanel />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {titleBar}
      <div className="px-4 pb-20 md:px-8">
        <UnitHero
          page={page}
          intro={intro}
          startLabel="開始遊戲"
          onStart={() => {
            preloadMonopoly();
            setEntered(true);
          }}
        />
        {seo}
      </div>
    </>
  );
}
