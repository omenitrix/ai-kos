"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "gold";
  size?: "default" | "sm" | "lg" | "icon";
}
export function Button({ className, variant="default", size="default", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string,string> = {
    default: "bg-[#C9A96A] text-white hover:bg-[#B8944F] shadow-soft hover:shadow-soft-lg",
    gold: "bg-gradient-to-br from-[#C9A96A] to-[#A68B4A] text-white hover:from-[#B8944F] hover:to-[#9A7F3D] shadow-soft",
    outline: "border border-[#E8DCC8] bg-white text-foreground hover:bg-[#FDFBF7] hover:border-[#C9A96A]",
    ghost: "text-muted-foreground hover:bg-[#F5F0E8] hover:text-foreground",
    secondary: "bg-[#F5F0E8] text-foreground hover:bg-[#EDE6D6]",
  };
  const sizes: Record<string,string> = { default:"h-10 px-6 py-2", sm:"h-8 px-4 text-xs", lg:"h-12 px-8 text-base", icon:"h-10 w-10" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
