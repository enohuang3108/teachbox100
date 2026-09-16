import { RadioGroup, RadioGroupItem } from "@/components/atoms/shadcn/radio-group";
import { cn } from "@/lib/utils";
import { SELECTED_OPTION } from "@/lib/ui-classes";

interface CoinsOrderProps{
    isOrdered:boolean,
    setIsOrdered:(isOrdered: boolean) => void
}

export const CoinsOrder:React.FC<CoinsOrderProps> = ({isOrdered, setIsOrdered}) => {
  const labels = {
    ordered: "按順序排列（由小到大）",
    random: "隨機排列",
  };

  return (
    <div className="space-y-2">
      <h3 className="mb-2 text-sm font-medium text-foreground">硬幣排列</h3>
      <RadioGroup
        value={isOrdered ? "ordered" : "random"}
        onValueChange={(value) => setIsOrdered(value === "ordered")}
        className="space-y-2"
      >
        {Object.entries(labels).map(([value, label]) => (
          <label key={value} className="group" htmlFor={`order-${value}`}>
            <div
              className={cn(
                "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                SELECTED_OPTION,
              )}
            >
              <RadioGroupItem value={value} id={`order-${value}`} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
