import type { MetadataRoute } from "next";
import { createSupabaseService } from "@/lib/supabase/server";

function getBase() {
  const raw = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  const v = (process.env.VERCEL_URL || "").trim();
  if (v) return `https://${v}`;
  return "https://ai-kos-ten.vercel.app";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getBase();
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/kos/cari`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/ai`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
  try {
    const supa = createSupabaseService();
    const { data } = await supa.from("kos_listings").select("slug,updatedAt").eq("status", "AKTIF").limit(500);
    const kosUrls: MetadataRoute.Sitemap = (data || []).map((k: any) => ({
      url: `${base}/kos/${k.slug}`,
      lastModified: k.updatedAt ? new Date(k.updatedAt) : now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    return [...statics, ...kosUrls];
  } catch {
    return statics;
  }
}
