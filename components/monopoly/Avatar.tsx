"use client";

import { type AvatarProps, BeanHead } from "beanheads";

// 各特徵的可選值（皆為 beanheads 合法 key）
const SKIN = ["light", "yellow", "brown", "dark"] as const;
const EYES = ["normal", "happy", "content", "squint", "wink", "heart"] as const;
const EYEBROWS = ["raised", "serious", "concerned"] as const;
const MOUTH = ["grin", "openSmile", "lips", "serious", "tongue"] as const;
const HAIR = ["long", "bun", "short", "pixie", "buzz", "afro", "bob"] as const;
const HAIR_COLOR = [
  "blonde",
  "orange",
  "black",
  "white",
  "brown",
  "blue",
  "pink",
] as const;
const CLOTHING = ["shirt", "dressShirt", "vneck", "tankTop", "dress"] as const;
const CLOTHING_COLOR = ["white", "blue", "black", "green", "red"] as const;
const ACCESSORY = ["none", "roundGlasses", "tinyGlasses", "shades"] as const;
const HAT = ["none", "beanie", "turban"] as const;
const BODY = ["chest", "breasts"] as const;

// 由 id 雜湊出穩定種子（同一玩家永遠長同一個樣子）
function hash(id: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(arr: readonly T[], seed: number, salt: number): T {
  const n = Math.imul(seed ^ salt, 2654435761) >>> 0;
  return arr[n % arr.length];
}

export function beanProps(id: string): AvatarProps {
  const s = hash(id);
  return {
    skinTone: pick(SKIN, s, 1),
    eyes: pick(EYES, s, 2),
    eyebrows: pick(EYEBROWS, s, 3),
    mouth: pick(MOUTH, s, 4),
    hair: pick(HAIR, s, 5),
    hairColor: pick(HAIR_COLOR, s, 6),
    clothing: pick(CLOTHING, s, 7),
    clothingColor: pick(CLOTHING_COLOR, s, 8),
    accessory: pick(ACCESSORY, s, 9),
    hat: pick(HAT, s, 10),
    // hatColor 必須指定，否則 beanheads 每次 render 會隨機挑色造成帽子閃爍
    hatColor: pick(CLOTHING_COLOR, s, 12),
    body: pick(BODY, s, 11),
    facialHair: "none",
    graphic: "none",
    lipColor: "red",
    lashes: true,
    mask: false,
    faceMask: false,
  };
}

export function PlayerAvatar({
  id,
  color,
  size = 32,
  ring = true,
}: {
  id: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-white"
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 2px ${color}` : undefined,
      }}
    >
      {/* 完整顯示整個人物，留一點內距避免頭頂被圓框切到 */}
      <span className="block h-[92%] w-[92%] [&_svg]:h-full [&_svg]:w-full">
        <BeanHead {...beanProps(id)} />
      </span>
    </span>
  );
}
