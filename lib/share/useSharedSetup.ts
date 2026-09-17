"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { decodeFor, type SetupOf, type ShareUnit } from "./units";

const dateLabel = (ms: number) =>
  new Date(ms).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * 網址帶著這個單元的分享設定時，交給 apply 寫進 store 並打開設定視窗，
 * 再跳 toast、清掉網址上的 hash 與 query（重新整理不會又蓋掉一次）。
 * 短連結導過來會帶 `?expires=&extended=`，完整連結沒有，只說已載入。
 */
export function useSharedSetup<K extends ShareUnit>(
  unit: K,
  apply: (setup: SetupOf<K>) => void,
) {
  // 不用 useEffectEvent：Next 15 內建的 React 沒有它，build 過得了、執行時才 500
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });

  useEffect(() => {
    let alive = true;
    decodeFor(unit, location.hash).then((setup) => {
      if (!alive || !setup) return;
      applyRef.current(setup);
      const query = new URLSearchParams(location.search);
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
      history.replaceState(null, "", location.pathname);
    });
    return () => {
      alive = false;
    };
  }, [unit]);
}
