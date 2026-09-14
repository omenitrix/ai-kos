"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "gold" | "dark";
  size?: "default" | "sm" | "lg" | "icon";
}
export function Button({ className, variant="default", size="default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96A]/40 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants: Record<string,string> = {
    default: "bg-[#C9A96A] text-white hover:bg-[#B8944F] shadow-soft hover:shadow-gold hover:-translate-y-px",
    gold: "bg-gradient-to-br from-[#C9A96A] to-[#A68B4A] text-white shadow-gold hover:from-[#B8944F] hover:to-[#9A7F3D] hover:shadow-gold-lg hover:-translate-y-px",
    dark: "bg-[#1C1610] text-white hover:bg-[#2C2416] shadow-soft hover:shadow-soft-lg border border-[#3A2E1E]",
    outline: "border border-[#E8DCC8] bg-white text-[#2C2416] hover:bg-[#FDFBF7] hover:border-[#C9A96A] hover:text-[#1C1610] shadow-sm hover:shadow-soft",
    ghost: "text-[#6B5E4F] hover:bg-[#F5F0E8] hover:text-[#2C2416]",
    secondary: "bg-[#F5F0E8] text-[#2C2416] hover:bg-[#EDE6D6] border border-transparent hover:border-[#E8DCC8]",
  };
  const sizes: Record<string,string> = { default:"h-10 px-6 py-2", sm:"h-8 px-4 text-xs", lg:"h-12 px-8 text-[15px]", icon:"h-10 w-10" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
