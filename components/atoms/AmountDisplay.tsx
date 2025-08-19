import { dseg7 } from "@/public/fonts/fonts";
import React from "react";

interface AmountDisplayProps {
  label?: string;
  amount: number | null;
  amountColor: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const AmountDisplay: React.FC<AmountDisplayProps> = ({
  label,
  amount,
  amountColor,
  size = "lg",
}) => {
  const sizeStyles = {
    sm: { container: "text-2xl", dollar: "text-lg", padding: "p-2" },
    md: { container: "text-3xl", dollar: "text-xl", padding: "p-6" },
    lg: { container: "text-5xl", dollar: "text-2xl", padding: "p-8" },
    xl: { container: "text-7xl", dollar: "text-4xl", padding: "p-10" },
  };

  return (
    <div
      className={`flex h-auto ${sizeStyles[size].padding} w-full flex-col items-center justify-center rounded-md bg-zinc-800`}
    >
      {label && (
        <div className="mb-2 text-sm font-medium text-gray-400">{label}</div>
      )}
      <div
        className={`flex items-end space-x-2 ${sizeStyles[size].container} font-bold ${amountColor} [text-shadow:0_0_20px]`}
      >
        <span className={`${sizeStyles[size].dollar} font-medium`}>$</span>
        <span className={dseg7.className}>
          {amount !== null ? amount : "--"}
        </span>
      </div>
    </div>
  );
};

export default AmountDisplay;
