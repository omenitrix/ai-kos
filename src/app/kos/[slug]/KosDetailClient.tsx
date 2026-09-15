"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";

const KosMap = dynamic(() => import("@/components/maps/kos-map"), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full rounded-2xl border border-[#EDE6D6] bg-[#FDFBF7] grid place-items-center text-sm text-[#8A7D6B]">Memuat peta…</div>,
});

export function KosDetailClient({ kos }: { kos: any }) {
  const kamar = (kos.kamars || kos.kamar || []) as any[];
  const kamarTersedia = kamar.filter((k: any) => k.tersedia);
  const kamarPenuh = kamar.filter((k: any) => !k.tersedia);
  const pins = kos.latitude != null && kos.longitude != null ? [{ id: kos.id, slug: kos.slug, nama: kos.nama, alamat: kos.alamat, harga: kamar[0]?.hargaBulanan ?? 0, lat: Number(kos.latitude), lng: Number(kos.longitude) }] : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/kos/cari" className="text-sm text-[#8A7D6B] hover:underline">← Kembali ke Pencarian</Link>
        <h1 className="serif text-[26px] leading-none mt-2">{kos.nama}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs border ${kos.status === "AKTIF" ? "bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]" : kos.status==="PENDING_APPROVAL" ? "bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]" : "bg-white border-[#EDE6D6]"}`}>
            {kos.status === "AKTIF" ? "Aktif" : kos.status==="PENDING_APPROVAL" ? "Menunggu Approval" : kos.status}
          </span>
          {kos.isFeatured && <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#1C1610] text-white">Featured</span>}
          <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#FDFBF7] border border-[#EDE6D6]">{kos.genderType}</span>
        </div>
        <p className="mt-2 text-sm text-[#8A7D6B]">{kos.alamat}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <Image src={kos.fotoSampul || "https://picsum.photos/seed/kos/800/450"} alt={kos.nama} width={800} height={240} className="rounded-2xl w-full h-60 object-cover border border-[#EDE6D6] shadow-soft" unoptimized />
            {Array.isArray(kos.fotoList) && kos.fotoList.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {kos.fotoList.slice(0,6).map((foto:string, idx:number) => (
                  <Image key={idx} src={foto} alt={`${kos.nama} ${idx+1}`} width={240} height={112} className="rounded-xl w-full h-28 object-cover border border-[#EDE6D6]" unoptimized />
                ))}
              </div>
            )}
          </div>

          <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
            <CardHeader><CardTitle className="text-sm">Deskripsi & Fasilitas</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#6B5E4F] leading-relaxed">{kos.deskripsi || "Belum ada deskripsi."}</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 text-[#6B5E4F]">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> AC</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> WiFi</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> Dapur</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> Laundry</span>
                </div>
                <div className="space-y-1 text-[#6B5E4F]">
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> Parkiran</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> Kamar Mandi Dalam</span>
                  <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#C9A96A]"/> 24/7 Security</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
            <CardHeader><CardTitle className="text-sm">Kamar Tersedia</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {kamarTersedia.length ? kamarTersedia.map((k:any) => (
                  <div key={k.id} className="border border-[#EDE6D6] rounded-2xl p-4 bg-[#FDFBF7]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">{k.nomor || "-"} - {k.tipe || kos.genderType}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#EAF6EC] border border-[#C8E6C9] text-[#2E7D32]">Tersedia</span>
                    </div>
                    <p className="text-xs text-[#8A7D6B] mb-2">
                      Luas: {k.luasM2 ?? "-"}m² • {k.furnished ? "Furnished" : "Unfurnished"} • {k.ac ? "AC" : "Kipas"} • WiFi: {k.wifi ? "Ya" : "Tidak"}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-bold text-[#C9A96A] text-sm">Rp {Number(k.hargaBulanan).toLocaleString("id-ID")}/bulan</span>
                      <Link href={`/kos/${kos.slug}/chat`}>
                        <Button size="sm" className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416] text-xs">Chat Owner</Button>
                      </Link>
                    </div>
                  </div>
                )) : <p className="text-xs text-[#8A7D6B]">Semua kamar sedang terisi.</p>}
              {kamarPenuh.length>0 && <p className="text-xs text-[#8A7D6B]">{kamarPenuh.length} kamar tidak tersedia saat ini.</p>}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
            <CardHeader><CardTitle className="text-sm">Booking & Kontak</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Link href={`/kos/${kos.slug}/chat`} className="block"><Button className="w-full rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">Chat dengan Owner</Button></Link>
                <p className="text-xs text-[#8A7D6B]">Owner biasanya membalas 1-2 jam. Semua chat tercatat.</p>
              </div>
              <div className="pt-4 border-t border-[#F5F0E8]">
                <h3 className="font-semibold text-sm mb-1">Hubungi Owner</h3>
                <p className="text-sm">{kos.owner?.name || "-"}</p>
                <p className="text-sm font-medium">{kos.owner?.phone || "-"}</p>
                <p className="text-xs text-[#8A7D6B]">{kos.owner?.email || ""}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {pins.length > 0 ? (
        <Card className="mt-6 rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Lokasi Kos</CardTitle>
            <p className="text-xs text-[#8A7D6B]">{kos.alamat} • {Number(kos.latitude).toFixed(4)}, {Number(kos.longitude).toFixed(4)}</p>
          </CardHeader>
          <CardContent className="p-0">
            <KosMap pins={pins} userLoc={null} />
            <div className="p-3 flex flex-wrap gap-2">
              <a href={`https://www.google.com/maps/search/?api=1&query=${kos.latitude},${kos.longitude}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium">Buka di Google Maps →</a>
              <Link href="/kos/cari" className="rounded-full border border-[#E8DCC8] bg-white px-4 py-2 text-xs font-medium">Cari kos terdekat</Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-6 rounded-2xl border-[#EDE6D6] shadow-soft">
          <CardHeader><CardTitle className="text-sm">Lokasi Kos</CardTitle></CardHeader>
          <CardContent><p className="text-xs text-[#8A7D6B]">Koordinat belum diisi owner untuk kos ini.</p></CardContent>
        </Card>
      )}
    </div>
  );
}
