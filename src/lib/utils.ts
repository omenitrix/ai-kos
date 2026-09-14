import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(n?: number | null) {
  if (n == null) return "-";
  return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function genInvoiceNo() {
  return "INV-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}
