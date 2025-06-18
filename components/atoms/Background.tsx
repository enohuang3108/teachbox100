import { RotatingFlower } from "./decoration";

interface BackgroundGradientProps {
  className?: string;
}

export function Background({ className }: BackgroundGradientProps) {
  return (
    <div className="absolute -z-10 h-full w-full bg-white">
      <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] bg-[size:24px_24px] opacity-30"></div>
      <RotatingFlower size={50} color="#d9a520" className="absolute right-12 top-40"/>
    </div>
  );
}
