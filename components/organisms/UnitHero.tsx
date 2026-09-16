"use client";

import type { Page } from "@/app/pages.config";
import { Button } from "@/components/atoms/shadcn/button";
import { getUnitIllustrationSrc } from "@/lib/unit-illustration";
import Image from "next/image";

/**
 * 單元的介紹頁頭：一句話定位、說明、開始鈕、去背插圖。
 * 先看說明再進內容的單元（大富翁、計時器、噪音計）共用；下面接 UnitSeoSection withIntro={false}，
 * 說明文字已經在這裡了，不再重複一次。
 */
export function UnitHero({
  page,
  intro,
  startLabel,
  onStart,
}: {
  page: Page;
  intro: string;
  startLabel: string;
  onStart: () => void;
}) {
  // 頭頁只放 intro 第一句：長介紹（計時器）整段攤開會把開始鈕擠到折線下
  const cut = intro.indexOf("。") + 1;
  const lead = cut > 0 ? intro.slice(0, cut) : intro;
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 pt-8 md:flex-row md:pt-16">
      <div className="flex-1 space-y-4">
        <p className="text-h1 text-balance text-ink">{page.headline ?? page.description}</p>
        <p className="text-body text-muted-foreground">{lead}</p>
        <Button
          size="lg"
          className="rounded-full px-10 text-base font-bold transition-transform duration-press ease-out active:scale-[0.97]"
          onClick={onStart}
        >
          {startLabel}
        </Button>
      </div>
      {/* 去背插圖直接站在紙上，跟其他單元說明區同一種處理 */}
      <div className="relative aspect-[4/3] w-full md:w-80">
        <Image
          fill
          priority
          src={getUnitIllustrationSrc(page)}
          sizes="(max-width: 768px) 92vw, 320px"
          alt=""
          className="object-contain"
        />
      </div>
    </section>
  );
}
