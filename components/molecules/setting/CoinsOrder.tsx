import { RadioGroup, RadioGroupItem } from "@/components/atoms/shadcn/radio-group";
import { cn } from "@/lib/utils";

interface CoinsOrderProps{
    isOrdered:boolean,
    setIsOrdered:(isOrdered: boolean) => void
}

export const CoinsOrder:React.FC<CoinsOrderProps> = ({isOrdered, setIsOrdered}) => {
  const orderSchemes = {
    ordered: {
      label: "按順序排列（由小到大）",
      bg: "group-has-[span[data-state=checked]]:bg-gray-100 hover:bg-gray-50",
      border: "group-has-[span[data-state=checked]]:border-gray-400",
    },
    random: {
      label: "隨機排列",
      bg: "group-has-[span[data-state=checked]]:bg-orange-100 hover:bg-orange-50",
      border: "group-has-[span[data-state=checked]]:border-orange-400",
    },
  };

  return (
    <div className="space-y-2">
      <h3 className="mb-2 text-sm font-medium text-gray-700">硬幣排列</h3>
      <RadioGroup
        value={isOrdered ? "ordered" : "random"}
        onValueChange={(value) => setIsOrdered(value === "ordered")}
        className="space-y-2"
      >
        {Object.entries(orderSchemes).map(([value, scheme]) => (
          <label key={value} className="group" htmlFor={`order-${value}`}>
            <div
              className={cn(
                "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                scheme.bg,
                scheme.border,
              )}
            >
              <RadioGroupItem value={value} id={`order-${value}`} />
              <span className="text-sm font-medium">{scheme.label}</span>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
