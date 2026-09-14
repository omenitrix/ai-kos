"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BorderBeam({ className, duration = 8, size = 120 }: { className?: string; duration?: number; size?: number }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent", className)}
      style={{
        background: `conic-gradient(from 0deg, transparent, hsl(var(--gold) / 0.6), transparent 30%) border-box`,
        mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
        maskComposite: "exclude",
        WebkitMaskComposite: "xor",
        animation: `spin ${duration}s linear infinite`,
      }}
    />
  );
}

export function BeamHero({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[28px] border border-[#EDE6D6] bg-white", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDFBF7] via-[#F9F3E8] to-white" />
      {/* beams */}
      <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-[#C9A96A]/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-[380px] w-[380px] rounded-full bg-[#E8DCC8]/30 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
