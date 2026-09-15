import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
import type { Metadata, Viewport } from "next";

function getBaseUrl() {
  const env: any = process.env as any;
  const raw = String(env["NEXTAUTH_URL"] || env["NEXT_PUBLIC_APP_URL"] || "").trim();
  if (raw && raw.startsWith("http")) return raw;
  const vercel = String(env["VERCEL_URL"] || "").trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

const base = getBaseUrl();

export const viewport: Viewport = {
  themeColor: "#C9A96A",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: { default: "AI-KOS — Hunian Elegan", template: "%s | AI-KOS" },
  description: "Sistem Cerdas Kelola Kos Modern dengan sentuhan luxury — cari kos terdekat via peta & AI Concierge, booking, pembayaran & marketplace.",
  applicationName: "AI-KOS",
  appleWebApp: { capable: true, title: "AI-KOS", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/favicon-192.png", sizes: "192x192", type: "image/png" }, { url: "/logo-512.png", sizes: "512x512", type: "image/png" }],
    apple: "/logo-512.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: base,
    siteName: "AI-KOS",
    title: "AI-KOS — Hunian Elegan",
    description: "Cari kos terdekat dari lokasi kamu • AI Concierge • Maps • Marketplace",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "AI-KOS — Hunian Elegan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-KOS — Hunian Elegan",
    description: "Sistem Cerdas Kelola Kos Modern — luxury living",
    images: ["/og-image.png"],
  },
  alternates: { canonical: base },
  category: "real-estate",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI-KOS",
    url: base,
    logo: `${base}/logo-512.png`,
    description: "Sistem Cerdas Kelola Kos Modern — Hunian Elegan",
    sameAs: [],
  };
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] font-sans text-foreground antialiased selection:bg-[#C9A96A]/20">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
        <PwaRegister />
      </body>
    </html>
  );
}
