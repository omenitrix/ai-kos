import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers";

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "AI-KOS — Hunian Elegan",
  description: "Sistem Cerdas Kelola Kos Modern dengan sentuhan luxury — cari kos terdekat via peta & AI Concierge",
  icons: { icon: [{ url: "/favicon.ico" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/favicon-192.png", sizes: "192x192", type: "image/png" }, { url: "/logo-512.png", sizes: "512x512", type: "image/png" }], apple: "/logo-512.png" },
  openGraph: { title: "AI-KOS — Hunian Elegan", description: "Cari kos terdekat dari lokasi kamu • AI Concierge • Maps", images: ["/og-image.png"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-foreground antialiased">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
