import { cn } from "@/lib/utils";

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const SimpleCard = ({ children, className }: CardProps) => {
  const Icon = ({
    className,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        {...rest}
        className={cn("absolute size-6 border-slate-600", className)}
      />
    );
  };
  return (
    <div className={cn(
      "relative rounded-lg border-2 border-slate-200 transition-all duration-200 hover:border-slate-300",
      className
    )}>
      <Icon className="-top-0.5 -left-0.5 rounded-tl-lg border-t-2 border-l-2" />
      <Icon className="-top-0.5 -right-0.5 rounded-tr-lg border-t-2 border-r-2" />
      <Icon className="-bottom-0.5 -left-0.5 rounded-bl-lg border-b-2 border-l-2" />
      <Icon className="-right-0.5 -bottom-0.5 rounded-br-lg border-r-2 border-b-2" />
      {children}
    </div>
  );
};
