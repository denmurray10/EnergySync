"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

type ProFeatureWrapperProps = {
  children: React.ReactNode;
  isPro: boolean;
  className?: string;
};

export function ProFeatureWrapper({ children, isPro, className }: ProFeatureWrapperProps) {
  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative", className)}>
      <div className="opacity-60 grayscale-[50%] pointer-events-none">
        {children}
      </div>
      <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
        <Star className="w-3 h-3 fill-white" />
        PRO
      </div>
    </div>
  );
}
