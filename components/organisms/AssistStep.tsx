"use client";

import { Accessibility } from "lucide-react";
import type { SetupStep } from "@/components/organisms/StepSetup";
import { SpeechSettings } from "@/components/organisms/SpeechSettings";
import { useSpeechStore } from "@/lib/questions/speech";

/**
 * 出題遊戲共用的「輔助」步驟：題目朗讀；顯示注音由 StepSetup 接在後面
 * （zhuyinStepKey="assist"、zhuyinPosition="after"）。
 */
export function useAssistStep(): SetupStep {
  const { reading, speechRate } = useSpeechStore();
  return {
    key: "assist",
    label: "輔助",
    icon: Accessibility,
    summary: reading ? `朗讀 ${speechRate} 倍` : "不朗讀",
    content: (
      <section className="space-y-6">
        <header>
          <h3 className="text-h3 text-ink">需要哪些輔助？</h3>
        </header>
        <SpeechSettings />
      </section>
    ),
  };
}
