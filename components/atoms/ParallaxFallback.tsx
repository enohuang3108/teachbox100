"use client";

import { useEffect } from "react";

/**
 * Firefox 穩定版還沒開 CSS scroll-driven animations（藏在
 * layout.css.scroll-driven-animations.enabled 這個 pref 後面），
 * globals.css 裡那條 @supports (animation-timeline: view()) 整段不會套用，
 * 視差等於不存在。這支只在不支援的瀏覽器接手，算出跟 CSS 版一模一樣的位移。
 *
 * 刻意做成沒有 markup 的獨立元件，PageDecor 才能維持 server component：
 * 它的裝飾資料陣列不必序列化送到瀏覽器。
 */
export function ParallaxFallback() {
  useEffect(() => {
    // Chrome / Safari 走原生 scroll timeline，連 listener 都不用掛
    if (CSS.supports("animation-timeline", "view()")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = [
      ...document.querySelectorAll<HTMLElement>(".decor-parallax"),
    ].map((el) => ({
      el,
      // --parallax-shift 是靜態值，只讀一次；每幀讀 computed style 太貴
      shift:
        Number.parseFloat(
          getComputedStyle(el).getPropertyValue("--parallax-shift"),
        ) || 0,
      // 上一幀套上去的位移，用來從 rect 還原出未變形的版面位置
      applied: 0,
    }));
    if (items.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewport = window.innerHeight;

      // 先一次讀完所有 rect，再一次寫完所有 transform。
      // 讀寫交錯的話，每個元素都會各觸發一次強制回流。
      const offsets = items.map(({ el, shift, applied }) => {
        const rect = el.getBoundingClientRect();
        if (rect.height === 0) return null; // 手機隱藏的那幾個

        // getBoundingClientRect 會把 transform 算進去，所以量到的是「已經被自己
        // 位移過」的位置。直接拿去算進度會形成回饋迴圈，位移量被自己壓掉一截 ——
        // 這就是 Firefox（走這條 JS 路徑）跟 Chrome（走原生 view() 時間軸，讀的是
        // 未變形的版面位置）對不起來的原因。扣掉上一幀套的量還原回去。
        const layoutTop = rect.top - applied;

        // 對齊 CSS 的 animation-range: cover 0% cover 100%
        const progress = (viewport - layoutTop) / (viewport + rect.height);
        return shift * (Math.min(Math.max(progress, 0), 1) - 0.5);
      });

      offsets.forEach((offset, i) => {
        if (offset !== null) {
          items[i].applied = offset;
          items[i].el.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      });
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      for (const { el } of items) el.style.transform = "";
    };
  }, []);

  return null;
}
