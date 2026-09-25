import confetti from "canvas-confetti";
import { BRAND } from "@/lib/design-tokens";

// Realistic Look 特效
export const realisticEffect = () => {
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 },
    ticks: 200,
    gravity: 0.5,
    scalar: 1.2,
  });
};

// Fireworks 特效
export const fireworksEffect = () => {
  const duration = 3 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
};

// Stars 特效
export const starsEffect = () => {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    shapes: ["star"],
    colors: ["FFE400", "FFBD00", "E89400", "FFCA6C", "FDFFB8"],
  };

  function shoot() {
    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ["star"],
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ["circle"],
    });
  }

  setTimeout(shoot, 0);
  setTimeout(shoot, 100);
  setTimeout(shoot, 200);
};

// School Pride 特效
export const schoolPrideEffect = () => {
  const end = Date.now() + 3 * 1000;
  const colors = ["#ff0000", "#ffffff"];

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

// 隨機選擇一個特效
export const getRandomConfettiEffect = () => {
  const effects = [
    realisticEffect,
    fireworksEffect,
    starsEffect,
    schoolPrideEffect,
  ];
  const randomEffect = effects[Math.floor(Math.random() * effects.length)];
  return randomEffect;
};

/*
 * 紙屑：品牌四色＋米白的紙片，給 StageConfetti 的 fire 用（全螢幕時也看得到）。
 * origin 是整個螢幕的比例座標，originOf 把某個元素的中心換算過去。
 */

type Fire = confetti.CreateTypes;
type Point = { x: number; y: number };

export const PAPER_CONFETTI = {
  colors: [BRAND.yellow, BRAND.red, BRAND.blue, BRAND.green, BRAND.paperWarm],
  scalar: 1.3,
  ticks: 260,
  gravity: 0.9,
};

export function originOf(el: Element | null): Point {
  if (!el) return { x: 0.5, y: 0.5 };
  const r = el.getBoundingClientRect();
  return {
    x: (r.left + r.width / 2) / window.innerWidth,
    y: (r.top + r.height / 2) / window.innerHeight,
  };
}

export function paperBurst(fire: Fire, origin: Point, count = 200, spread = 120) {
  fire({ ...PAPER_CONFETTI, particleCount: count, spread, startVelocity: 55, origin });
}

/** 左右兩門砲連發；回傳 interval id 讓呼叫端清掉 */
export function paperCannons(fire: Fire, ms: number) {
  const end = Date.now() + ms;
  const id = setInterval(() => {
    if (Date.now() > end) return clearInterval(id);
    fire({ ...PAPER_CONFETTI, particleCount: 7, angle: 60, spread: 55, startVelocity: 75, origin: { x: 0, y: 0.75 } });
    fire({ ...PAPER_CONFETTI, particleCount: 7, angle: 120, spread: 55, startVelocity: 75, origin: { x: 1, y: 0.75 } });
  }, 60);
  return id;
}
