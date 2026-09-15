import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI-KOS — Hunian Elegan",
    short_name: "AI-KOS",
    description: "Sistem Cerdas Kelola Kos Modern — cari kos terdekat via peta & AI Concierge",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#C9A96A",
    icons: [
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/logo-512.png", sizes: "512x512", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" as any },
    ],
  };
}
