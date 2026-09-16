"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GAME_STAGE_ID } from "./PageTemplate";

/**
 * 要貼在螢幕邊角的東西（計時器的操作鈕、噪音計的敏感度尺）包這層。
 * 全螢幕時 [data-stage-inner] 帶 transform 做等比縮放，裡面的 position: fixed 會改以它為準、縮進舞台框；
 * portal 到沒有 transform 的 #game-stage，一般與全螢幕都貼著螢幕邊。
 */
export function StageFixed({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<HTMLElement | null>(null);
  useEffect(() => setStage(document.getElementById(GAME_STAGE_ID)), []);
  return stage ? createPortal(children, stage) : null;
}
