import { dseg7 } from "@/public/fonts/fonts";
import React from "react";

interface AmountDisplayProps {
  label: string;
  amount: number | null;
  amountColor: string;
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  label,
  amount,
  amountColor,
}) => {
  return (
    <div className="flex h-32 w-full flex-col items-center justify-center rounded-md bg-zinc-800">
      <div className="mb-1 pb-2 text-sm font-medium text-gray-400">{label}</div>
      <div
        className={`flex items-end space-x-2 text-5xl font-bold ${amountColor} [text-shadow:0_0_20px]`}
      >
        <span className="text-2xl font-medium">$</span>
        <span className={dseg7.className}>
          {amount !== null ? amount : "--"}
        </span>
      </div>
    </div>
  );
};

export default AmountDisplay;
