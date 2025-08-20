import { RadioGroup, RadioGroupItem } from "@/components/atoms/shadcn/radio-group";
import { cn } from "@/lib/utils";

interface AnswerMethodProps{
    answerMethod:string,
    setAnswerMethod:(method: string) => void
}

export const AnswerMethod:React.FC<AnswerMethodProps> =({answerMethod, setAnswerMethod})=>{
  const colorSchemes = {
    digit: {
      label: "數字調整",
      bg: "group-has-[span[data-state=checked]]:bg-blue-100 hover:bg-blue-50",
      border: "group-has-[span[data-state=checked]]:border-blue-400",
    },
    multiple: {
      label: "選擇題",
      bg: "group-has-[span[data-state=checked]]:bg-purple-100 hover:bg-purple-50",
      border: "group-has-[span[data-state=checked]]:border-purple-400",
    },
    keypad: {
      label: "手動輸入",
      bg: "group-has-[span[data-state=checked]]:bg-gray-100 hover:bg-gray-50",
      border: "group-has-[span[data-state=checked]]:border-gray-400",
    },
  };

  return (
    <div className="space-y-2">
      <h3 className="mb-2 text-sm font-medium text-gray-700">回答方式</h3>
      <RadioGroup
        value={answerMethod}
        onValueChange={setAnswerMethod}
        className="space-y-2"
      >
        {Object.entries(colorSchemes).map(([value, scheme]) => (
          <label key={value} className="group" htmlFor={`answer-${value}`}>
            <div
              className={cn(
                "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                scheme.bg,
                scheme.border,
              )}
            >
              <RadioGroupItem value={value} id={`answer-${value}`} />
              <span className="text-sm font-medium">{scheme.label}</span>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
