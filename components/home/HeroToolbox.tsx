"use client";

import { BarkleyEyes } from "@/components/atoms/BarkleyEyes";
import Image from "next/image";
import { useState, type CSSProperties } from "react";

/*
 * 首頁主視覺：一開始是關著的教具箱，點一下箱蓋彈開、阿黃探出頭、教具一件件彈出來；再點一下收回去關上。
 * 原圖是 gpt-image 生成的透明 PNG：開箱圖切成箱子的六層＋五件教具，被阿黃擋住的箱蓋與托盤補畫過；
 * 關著的箱蓋另外生成，對齊同一張 904×700 的座標，所以箱子每一層都是 inset-0 疊在同一個框裡。
 * 教具座標是各層在 1316×968 畫框裡的百分比；from 是從箱口出發的位移，單位是該層自己的寬高 %。
 */
const TOOLS = [
  {
    name: "wheel",
    left: 0,
    top: 16.12,
    width: 20.06,
    w: 264,
    h: 292,
    from: [189, 102],
    float: "8s",
  },
  {
    name: "clock",
    left: 17.93,
    top: 5.37,
    width: 19.15,
    w: 252,
    h: 252,
    from: [107, 167],
    float: "9.5s",
  },
  {
    name: "coin",
    left: 38.3,
    top: 0,
    width: 18.24,
    w: 240,
    h: 244,
    from: [3, 196],
    float: "7s",
  },
  {
    name: "dice",
    left: 58.97,
    top: 5.79,
    width: 17.63,
    w: 232,
    h: 236,
    from: [-112, 180],
    float: "10s",
  },
  {
    name: "stopwatch",
    left: 72.95,
    top: 16.12,
    width: 20.67,
    w: 272,
    h: 292,
    from: [-171, 102],
    float: "8.5s",
  },
];

// 眼白與眼珠量自開箱原圖（904×700）。原圖的眼珠往右上看教具，靜止時保留這個方向，滑鼠一動就跟著轉
const EYES = [
  { cx: 454.5, cy: 225.5, rx: 34.5, ry: 38.5, rot: 12 },
  { cx: 540.5, cy: 183, rx: 34.5, ry: 38, rot: 12 },
];

const BOX_SIZES = "(max-width: 1024px) 64vw, 420px";

function Layer({ name, className }: { name: string; className: string }) {
  return (
    <Image
      src={`/images/home/toolbox/${name}.webp`}
      alt=""
      fill
      priority
      sizes={BOX_SIZES}
      className={`${className} object-contain`}
    />
  );
}

export function HeroToolbox() {
  const [open, setOpen] = useState(false);
  // 開過一次之後再關上才播收回動畫；第一次載入的關箱直接是關著的
  const [touched, setTouched] = useState(false);

  return (
    <div
      data-state={open ? "open" : "closed"}
      data-touched={touched || undefined}
      className="toolbox relative aspect-[1316/968] w-full"
    >
      <span
        aria-hidden
        className="toolbox-plate halftone-plate absolute top-[-8%] left-[11%] aspect-square w-[78%] rounded-full"
      />

      {/* 教具排在箱子前面的 DOM 順序、畫在箱子後面：起點在箱子裡，被箱壁擋住 */}
      {TOOLS.map((tool, i) => (
        <div
          key={tool.name}
          className="absolute"
          style={{
            left: `${tool.left}%`,
            top: `${tool.top}%`,
            width: `${tool.width}%`,
          }}
        >
          <Image
            src={`/images/home/toolbox/${tool.name}.webp`}
            alt=""
            width={tool.w}
            height={tool.h}
            sizes="(max-width: 1024px) 18vw, 120px"
            className="tool-pop h-auto w-full"
            style={
              {
                "--from-x": `${tool.from[0]}%`,
                "--from-y": `${tool.from[1]}%`,
                "--float": tool.float,
                "--i": i,
              } as CSSProperties
            }
          />
        </div>
      ))}

      {/*
        箱子由後往前疊七層，全部對齊同一張 904×700 的座標：
        打開的箱蓋 → 箱內壁 → 托盤 → 阿黃（身體＋兩隻手臂）→ 金色正面 → 搭在箱緣的手 → 關著的箱蓋。
        手臂各自以肩膀為軸轉動，手掌永遠連著身體。
        金色正面兩種狀態共用、永遠不動，箱子開關時只有它前後的東西在動。
      */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setTouched(true);
        }}
        aria-label={open ? "關上教具箱" : "打開教具箱"}
        className="toolbox-box absolute aspect-[904/700] cursor-pointer"
        style={{ left: "13.98%", top: "27.69%", width: "68.69%" }}
      >
        <Layer name="lid-open" className="tb-lid-open" />
        <Layer name="back" className="tb-back" />
        {/* 裁切框不跟著動：托盤與阿黃往下縮的那段不會從箱底露出來 */}
        <span className="toolbox-clip absolute inset-0">
          <Layer name="tray" className="tb-tray" />
          <span className="tb-dog absolute inset-0">
            <Image
              src="/images/home/toolbox/barkley.webp"
              alt="阿黃從打開的教具箱探出頭，轉盤、時鐘、硬幣、骰子和碼表從箱子裡彈出來"
              fill
              priority
              sizes={BOX_SIZES}
              className="object-contain"
            />
            <BarkleyEyes
              eyes={EYES}
              width={904}
              height={700}
              pupilR={17.5}
              travel={13}
              rest={[6, -12]}
              eyeFill="#f9efdb"
              pupilFill="#161714"
            />
            <Layer name="arm-l" className="tb-arm-l" />
            <Layer name="arm-r" className="tb-arm-r" />
          </span>
        </span>
        <Layer name="front" className="" />
        {/* 搭在箱緣上的兩隻手要畫在正面前面：同一組手臂再疊一份，跟阿黃跑同一支動畫，只在手高過箱口時切換 */}
        <span aria-hidden className="tb-dog tb-dog-front absolute inset-0">
          <Layer name="arm-l" className="tb-arm-l" />
          <Layer name="arm-r" className="tb-arm-r" />
        </span>
        <Layer name="lid-closed" className="tb-lid-closed" />
      </button>
    </div>
  );
}
