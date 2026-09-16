import { RadioGroup, RadioGroupItem } from "@/components/atoms/shadcn/radio-group";
import { cn } from "@/lib/utils";
import { SELECTED_OPTION } from "@/lib/ui-classes";

interface AnswerMethodProps{
    answerMethod:string,
    setAnswerMethod:(method: string) => void
}

export const AnswerMethod:React.FC<AnswerMethodProps> =({answerMethod, setAnswerMethod})=>{
  const labels = {
    digit: "數字調整",
    multiple: "選擇題",
    keypad: "手動輸入",
  };

  return (
    <div className="space-y-2">
      <h3 className="mb-2 text-sm font-medium text-foreground">回答方式</h3>
      <RadioGroup
        value={answerMethod}
        onValueChange={setAnswerMethod}
        className="space-y-2"
      >
        {Object.entries(labels).map(([value, label]) => (
          <label key={value} className="group" htmlFor={`answer-${value}`}>
            <div
              className={cn(
                "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                SELECTED_OPTION,
              )}
            >
              <RadioGroupItem value={value} id={`answer-${value}`} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  )
}
