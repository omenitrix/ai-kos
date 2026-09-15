import type { Metadata } from "next";
import { createSupabaseService } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { KosDetailClient } from "./KosDetailClient";

function getBase() {
  const raw = (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim();
  if (raw.startsWith("http")) return raw.replace(/\/$/, "");
  const v = (process.env.VERCEL_URL || "").trim();
  if (v) return `https://${v}`;
  return "https://ai-kos-ten.vercel.app";
}

async function getKos(slugOrId: string) {
  const supa = createSupabaseService();
  let { data: kos } = await supa.from("kos_listings").select("*, kamars(*), promos(*), marketplace_services(*), owner:users!kos_listings_ownerId_fkey(name,phone,email)").eq("slug", slugOrId).maybeSingle();
  if (!kos) {
    const r = await supa.from("kos_listings").select("*, kamars(*), promos(*), marketplace_services(*), owner:users!kos_listings_ownerId_fkey(name,phone,email)").eq("id", slugOrId).maybeSingle();
    kos = r.data as any;
  }
  return kos as any;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const kos = await getKos(params.slug);
  if (!kos) return { title: "Kos tidak ditemukan | AI-KOS" };
  const base = getBase();
  const harga = kos.kamars?.[0]?.hargaBulanan ? `Rp ${Number(kos.kamars[0].hargaBulanan).toLocaleString("id-ID")}/bulan` : "Harga hubungi owner";
  const desc = kos.deskripsi ? kos.deskripsi.slice(0, 155) : `${kos.nama} — ${kos.alamat} • ${kos.genderType} • ${harga}. Booking via AI-KOS.`;
  const img = kos.fotoSampul || (Array.isArray(kos.fotoList) && kos.fotoList[0]) || "/og-image.png";
  return {
    title: `${kos.nama} — ${harga}`,
    description: desc,
    alternates: { canonical: `${base}/kos/${kos.slug}` },
    openGraph: {
      title: `${kos.nama} | AI-KOS`,
      description: desc,
      url: `${base}/kos/${kos.slug}`,
      images: [{ url: img, width: 1200, height: 630, alt: kos.nama }],
      type: "website",
      locale: "id_ID",
      siteName: "AI-KOS",
    },
    twitter: { card: "summary_large_image", title: kos.nama, description: desc, images: [img] },
  };
}

export default async function KosDetailPage({ params }: { params: { slug: string } }) {
  const kos = await getKos(params.slug);
  if (!kos) notFound();

  const base = getBase();
  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: kos.nama,
    description: kos.deskripsi || kos.alamat,
    address: kos.alamat,
    url: `${base}/kos/${kos.slug}`,
    image: kos.fotoSampul || kos.fotoList?.[0] || `${base}/og-image.png`,
    geo: kos.latitude ? { "@type": "GeoCoordinates", latitude: Number(kos.latitude), longitude: Number(kos.longitude) } : undefined,
    offers: (kos.kamars || []).slice(0, 5).map((k: any) => ({
      "@type": "Offer",
      name: `${k.nomor || k.tipe || "Kamar"}`,
      price: String(k.hargaBulanan),
      priceCurrency: "IDR",
      availability: k.tersedia ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <KosDetailClient kos={kos} />
    </>
  );
}
