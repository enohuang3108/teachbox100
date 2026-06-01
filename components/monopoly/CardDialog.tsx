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
          <DialogTitle>{pending.deck === "chance" ? "機會" : "命運"}</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          className="rounded-lg border-2 p-6 text-center text-lg font-medium"
        >
          {pending.card.text}
        </motion.div>
        <Button className="w-full" onClick={onResolve}>
          確定
        </Button>
      </DialogContent>
    </Dialog>
  );
}
