import { cn } from "@/lib/utils";

interface CardProps {
  children?: React.ReactNode;
  className?: string;
}

export const SimpleCard = ({ children, className = "p-4" }: CardProps) => {
  const Icon = ({
    className,
    ...rest
  }: React.HTMLAttributes<HTMLDivElement>) => {
    return (
      <div
        {...rest}
        className={cn("absolute size-6 border-zinc-700", className)}
      />
    );
  };
  return (
    <div className="relative rounded-md border-2 border-zinc-100">
      <Icon className="-top-0.5 -left-0.5 rounded-tl-md border-t-2 border-l-2" />
      <Icon className="-top-0.5 -right-0.5 rounded-tr-md border-t-2 border-r-2" />
      <Icon className="-bottom-0.5 -left-0.5 rounded-bl-md border-b-2 border-l-2" />
      <Icon className="-right-0.5 -bottom-0.5 rounded-br-md border-r-2 border-b-2" />
      {children}
    </div>
  );
};
