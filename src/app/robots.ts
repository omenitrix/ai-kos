import type { MetadataRoute } from "next";

function getBase() {
  const raw = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  const v = (process.env.VERCEL_URL || "").trim();
  if (v) return `https://${v}`;
  return "https://ai-kos-ten.vercel.app";
}

export default function robots(): MetadataRoute.Robots {
  const base = getBase();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
