"use client"

import { Flower } from "@/components/atoms/decoration";
import type { FlowerProps } from "@/components/atoms/decoration/Flower";
import { withMouse } from "@/lib/hoc/withMouse";
import type { WithRotateProps } from "@/lib/hoc/withRotate";
import { withRotate } from "@/lib/hoc/withRotate";

const RFlower = withMouse(withRotate(Flower));

export function RotatingFlower(props: FlowerProps & WithRotateProps) {
  return <RFlower {...props} />;
}
