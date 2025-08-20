interface RadioButtonProps {
  isSelected: boolean;
  label: string;
  onClick: () => void;
  colorScheme?: "purple" | "gray" | "blue" | "green" | "orange";
}

export function RadioButton({
  isSelected,
  label,
  onClick,
  colorScheme = "blue",
}: RadioButtonProps) {
  // 顏色配置
  const colorStyles = {
    purple: {
      active: "border-purple-400 bg-purple-100 text-purple-800",
      dot: "border-purple-400 bg-purple-400",
    },
    gray: {
      active: "border-gray-400 bg-gray-100 text-gray-800",
      dot: "border-gray-500 bg-gray-500",
    },
    blue: {
      active: "border-blue-400 bg-blue-100 text-blue-800",
      dot: "border-blue-400 bg-blue-400",
    },
    green: {
      active: "border-green-400 bg-green-100 text-green-800",
      dot: "border-green-400 bg-green-400",
    },
    orange: {
      active: "border-orange-400 bg-orange-100 text-orange-800",
      dot: "border-orange-400 bg-orange-400",
    },
  };

  const activeStyle = isSelected
    ? colorStyles[colorScheme].active
    : "border-gray-300 text-gray-700 hover:bg-gray-100";

  const dotStyle = isSelected
    ? colorStyles[colorScheme].dot
    : "border-gray-400";

  return (
    <button
      className={`flex cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors ${activeStyle}`}
      onClick={onClick}
      type="button"
      aria-label={`${isSelected ? "已選擇" : "未選擇"} ${label}`}
    >
      <div className={`h-4 w-4 rounded-full border-2 ${dotStyle}`} />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default RadioButton;
