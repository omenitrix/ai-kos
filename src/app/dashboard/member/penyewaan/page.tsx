import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberPenyewaan() {
  const bookings = [
    { id: "b1", kos: { nama: "Kos Aman Sentosa" }, kamar: { nomor: "A-01" }, tglMulai: "2026-09-01", tglSelesai: "2026-12-01", status: "ACTIVE" },
    { id: "b2", kos: { nama: "Kos Elite Cempaka" }, kamar: { nomor: "B-05" }, tglMulai: "2026-06-01", tglSelesai: "2026-08-31", status: "SELESAI" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-xl font-semibold">Riwayat Penyewaan</h2>
      <div className="space-y-4">
        {bookings.map((b) => (
          <Card key={b.id} className="border">
            <CardHeader className="flex items-center p-4">
              <div className="flex-1">
                <CardTitle className="text-base">{b.kos.nama}</CardTitle>
                <p className="text-sm text-muted-foreground">Kamar {b.kamar.nomor} • {b.tglMulai} s/d {b.tglSelesai || "sekarang"}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded-full text-xs ${b.status === "ACTIVE" ? "bg-green-100 text-green-800" : b.status === "SELESAI" ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}>
                  {b.status === "ACTIVE" ? "Aktif" : b.status === "SELESAI" ? "Selesai" : b.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Link href={`/dashboard/member/penyewaan/${b.id}`}>
                <Button size="sm" variant="outline">Lihat Detail</Button>
              </Link>
              {b.status === "ACTIVE" && (
                <Link href={`/dashboard/member/pembayaran/${b.id}`}>
                  <Button className="mt-2 w-full">Bayar Tagihan</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
