import { Skeleton } from "@/components/atoms/shadcn/skeleton";

interface CardSkeletonProps {
  cardWidth?: number;
}

export const CardSkeleton = ({ cardWidth = 300 }: CardSkeletonProps) => {
  return (
    <div
      className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm pb-3 overflow-hidden"
      style={{ width: cardWidth }}
    >
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />
      
      {/* Content skeleton */}
      <div className="px-2 py-0 sm:px-4 sm:pb-3">
        <Skeleton className="h-6 w-3/4 mt-3 mb-1" /> {/* Title */}
        <Skeleton className="h-4 w-full mb-1" /> {/* Description line 1 */}
        <Skeleton className="h-4 w-2/3" /> {/* Description line 2 */}
      </div>
    </div>
  );
};