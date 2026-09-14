"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ShimmerButton({
  children,
  className,
  shimmerClassName,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { shimmerClassName?: string }) {
  return (
    <button
      className={cn(
        "relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-[#C9A96A] px-7 text-sm font-semibold text-white transition-all hover:bg-[#B8944F] hover:shadow-gold hover:-translate-y-px active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <span
        className={cn(
          "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent",
          "animate-[shimmer_1.6s_infinite]",
          shimmerClassName
        )}
        style={{ backgroundSize: "200% 100%" }}
      />
    </button>
  );
}

export function ShineCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[20px] border border-[#EDE6D6] bg-white shadow-soft group", className)}>
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-[#C9A96A]/10 to-transparent -translate-x-full group-hover:translate-x-full duration-1000" />
      {children}
    </div>
  );
}
