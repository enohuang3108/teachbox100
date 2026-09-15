"use client";

import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { IchibanCarousel } from "./IchibanCarousel";
import styles from "./IchibanCarousel.module.css";
import { IchibanTearCard, type IchibanPrize } from "./IchibanTearCard";

export function IchibanExperience() {
  const [selectedPrize, setSelectedPrize] = useState<IchibanPrize | null>(null);

  if (!selectedPrize) return <IchibanCarousel onSelect={setSelectedPrize} />;

  return (
    <div className={styles.enterTear}>
      <button
        type="button"
        onClick={() => setSelectedPrize(null)}
        className="text-ink-soft hover:text-ink mb-3 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-extrabold outline-offset-4 transition-colors"
      >
        <ChevronLeft aria-hidden size={18} strokeWidth={2.2} />
        返回選籤
      </button>
      <IchibanTearCard prize={selectedPrize} />
    </div>
  );
}
