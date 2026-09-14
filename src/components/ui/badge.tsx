import * as React from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <span className={cn("inline-flex items-center rounded-full bg-[#F5F0E8] border border-[#E8DCC8] px-3 py-1 text-[11px] font-semibold tracking-widest uppercase text-[#8A7D6B]", className)} {...props} />;
}
