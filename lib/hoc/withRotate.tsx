"use client";

import { cn } from "@/lib/utils";

export interface WithRotateProps {
  slowDuration?: number;
  rotationAmount?: number;
  className?: string;
}

export function withRotate<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithRotateComponent(props: P & WithRotateProps) {
    const {
      className,
      ...restProps
    } = props;

    return (
      <div
        className={cn("inline-block animate-spin-slow-infinite", className)}
      >
        <WrappedComponent {...(restProps as P)} />
      </div>
    );
  };
}
