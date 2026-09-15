"use client";

import { ChevronLeft } from "lucide-react";
import { useCallback, useState } from "react";
import { IchibanCarousel } from "./IchibanCarousel";
import { IchibanTearCard, type IchibanPrize } from "./IchibanTearCard";

export function IchibanExperience() {
  const [selectedPrize, setSelectedPrize] = useState<IchibanPrize | null>(null);
  const [tearReady, setTearReady] = useState(false);
  const handleTearReady = useCallback(() => setTearReady(true), []);

  return (
    <div className="relative">
      {selectedPrize && (
        <>
          <button
            type="button"
            onClick={() => {
              setSelectedPrize(null);
              setTearReady(false);
            }}
            className="text-ink-soft hover:text-ink bg-paper/80 fixed top-20 left-4 z-40 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-extrabold outline-offset-4 backdrop-blur transition-colors"
          >
            <ChevronLeft aria-hidden size={18} strokeWidth={2.2} />
            返回選籤
          </button>
          <IchibanTearCard prize={selectedPrize} onReady={handleTearReady} />
        </>
      )}
      {/* 輪播停在和撕票畫面對齊的最後一格蓋在上面；撕票 canvas 畫好第一格才直接移除。
          不用交叉淡化：兩層邊框差 1px 疊在一起反而像重影。 */}
      {!tearReady && (
        <div className={selectedPrize ? "pointer-events-none absolute inset-x-0 top-0 z-30" : undefined}>
          <IchibanCarousel onSelect={setSelectedPrize} />
        </div>
      )}
    </div>
  );
}
