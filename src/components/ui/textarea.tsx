import * as React from "react";
import { cn } from "@/lib/utils";
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[88px] w-full rounded-xl border border-[#E8DCC8] bg-white px-4 py-3 text-sm text-[#2C2416] placeholder:text-[#B8A99A] shadow-sm transition-all duration-200",
        "hover:border-[#D8C9AA] focus-visible:outline-none focus-visible:border-[#C9A96A] focus-visible:ring-2 focus-visible:ring-[#C9A96A]/20 focus-visible:shadow-soft",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
