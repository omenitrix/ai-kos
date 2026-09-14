import * as React from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-[#E8DCC8] bg-white px-3 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#8A7D6B] shadow-sm",
        className
      )}
      {...props}
    />
  );
}
export function BadgeGold({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-[#1C1610] px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-[#C9A96A] border border-[#3A2E1E]",
        className
      )}
      {...props}
    />
  );
}
