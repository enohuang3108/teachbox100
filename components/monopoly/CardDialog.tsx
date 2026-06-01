"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import type { PendingAction } from "@/lib/monopoly/types";
import { motion } from "motion/react";
import NextImage from "next/image";

const DECK_IMG: Record<"chance" | "fate", string> = {
  chance: "/images/monopoly/chance.webp",
  fate: "/images/monopoly/fate.webp",
};

export function CardDialog({
  pending,
  onResolve,
}: {
  pending: PendingAction;
  onResolve: () => void;
}) {
  const open = pending?.kind === "drawCard";
  if (!open || pending?.kind !== "drawCard") return null;

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {pending.deck === "chance" ? "機會" : "命運"}
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className="flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center text-lg font-medium"
        >
          <NextImage
            src={DECK_IMG[pending.deck]}
            alt={pending.deck === "chance" ? "機會卡" : "命運卡"}
            width={120}
            height={160}
            className="h-40 w-auto"
          />
          {pending.card.text}
        </motion.div>
        <Button className="w-full" onClick={onResolve}>
          確定
        </Button>
      </DialogContent>
    </Dialog>
  );
}
