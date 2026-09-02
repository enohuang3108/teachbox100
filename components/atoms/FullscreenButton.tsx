"use client";

import { cn } from "@/lib/utils";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * 把 targetId 那個元素丟進原生全螢幕，給上課投影用。
 *
 * 頂列、SEO 說明與 FAQ 都不在那棵子樹裡，所以不用另外藏它們。
 * 全螢幕下 y 軸鎖死不捲動（見 globals.css），為此把遊戲整塊等比縮到塞得下，
 * 比例寫進 --fs-scale——一套邏輯吃掉六個遊戲 × 所有解析度，
 * 不用每頁各寫一組 media query。
 *
 * 不支援 element fullscreen 的瀏覽器（iOS Safari）直接不渲染這顆鈕。
 */
export const FullscreenButton = ({
  targetId,
  className,
}: {
  targetId: string;
  className?: string;
}) => {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  const fit = useCallback(() => {
    const stage = document.getElementById(targetId);
    const inner = stage?.firstElementChild as HTMLElement | undefined;
    if (!stage || !inner) return;
    if (document.fullscreenElement !== stage) {
      stage.style.removeProperty("--fs-scale");
      return;
    }
    const cs = getComputedStyle(stage);
    const avail =
      stage.clientHeight -
      parseFloat(cs.paddingTop) -
      parseFloat(cs.paddingBottom);
    // offsetHeight 是版面高度，不受 transform 影響，所以量測不會跟縮放互相追著跑
    const need = inner.offsetHeight;
    stage.style.setProperty(
      "--fs-scale",
      String(need > 0 ? Math.min(1, avail / need) : 1),
    );
  }, [targetId]);

  useEffect(() => {
    setSupported(document.fullscreenEnabled);

    const stage = document.getElementById(targetId);
    const inner = stage?.firstElementChild;
    // 遊戲內容會長高變矮（選了商品、加了硬幣），所以盯著它重算，不是只算一次
    const ro = inner ? new ResizeObserver(fit) : null;
    if (inner) ro?.observe(inner);

    // ESC 或 F11 離開也要同步圖示，所以狀態一律從瀏覽器讀回來
    const sync = () => {
      setActive(document.fullscreenElement?.id === targetId);
      fit();
    };
    document.addEventListener("fullscreenchange", sync);
    window.addEventListener("resize", fit);
    return () => {
      ro?.disconnect();
      document.removeEventListener("fullscreenchange", sync);
      window.removeEventListener("resize", fit);
    };
  }, [targetId, fit]);

  if (!supported) return null;

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document
        .getElementById(targetId)
        ?.requestFullscreen()
        .catch(() => {});
    }
  };

  const Icon = active ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "離開全螢幕" : "全螢幕"}
      className={cn(
        "flex cursor-pointer items-center justify-center",
        className,
      )}
    >
      <Icon size={20} strokeWidth={2} />
    </button>
  );
};
