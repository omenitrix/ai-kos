import * as React from "react";
import { cn } from "@/lib/utils";
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-[#E8DCC8] bg-white px-4 py-2 text-sm text-[#2C2416] placeholder:text-[#B8A99A] shadow-sm transition-all duration-200",
        "hover:border-[#D8C9AA] focus-visible:outline-none focus-visible:border-[#C9A96A] focus-visible:ring-2 focus-visible:ring-[#C9A96A]/20 focus-visible:shadow-soft",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#FDFBF7]",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";
