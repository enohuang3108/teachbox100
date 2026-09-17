"use client";

import { pages, siblingsOf } from "@/app/pages.config";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { PageTitleBar } from "@/components/molecules/PageTitleBar";
import { UnitHero } from "@/components/organisms/UnitHero";
import { getBreadcrumbTrail } from "@/lib/jsonld";
import { decodeSetup } from "@/lib/monopoly/share";
import { preloadMonopoly } from "@/lib/monopoly/preload";
import { useMonopolyStore } from "@/lib/monopoly/store";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

  // 老師分享的連結：把設定、玩家、題目帶進草稿後直接開設定，讓收到的人確認再開始
  useEffect(() => {
    decodeSetup(location.hash).then((setup) => {
      if (!setup) return;
      useMonopolyStore.setState({
        game: null,
        draftSettings: setup.settings,
        draftPlayers: setup.players,
        draftQuestions: setup.questions ?? [],
      });
      notifyLoaded(new URLSearchParams(location.search));
      history.replaceState(null, "", location.pathname);
      preloadMonopoly();
      setEntered(true);
    });
  }, []);

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

const dateLabel = (ms: number) =>
  new Date(ms).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/** 短連結才有 expires 可講；完整連結不會過期，只說已載入 */
function notifyLoaded(query: URLSearchParams) {
  const expires = Number(query.get("expires"));
  toast.success("已載入分享連結", {
    // 預設 4 秒；設定視窗同時打開，老師視線不在提示上，留久一點
    duration: 6_000,
    description: !expires
      ? undefined
      : query.get("extended")
        ? `連結快到期了，已延長到 ${dateLabel(expires)}`
        : `這個連結會在 ${dateLabel(expires)} 過期`,
  });
}
