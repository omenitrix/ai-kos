import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MemberActiveBooking() {
  const booking = { id: "b1", kos: { nama: "Kos Aman Sentosa", alamat: "Jl. Merdeka No.10" }, kamar: { nomor: "A-01", hargaBulanan: 1500000 }, tglMulai: "2026-09-01", tglSelesai: "2026-12-01", status: "ACTIVE" };
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/member/penyewaan" className="text-sm text-muted-foreground hover:underline">&larr; Kembali ke Riwayat</Link>
        <h1 className="mt-2 text-2xl font-bold">Kontrak Sewa Aktif</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Detail Kos & Kamar</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p><strong>Kos:</strong> {booking.kos.nama}</p>
              <p><strong>Alamat:</strong> {booking.kos.alamat}</p>
              <p><strong>Kamar:</strong> {booking.kamar.nomor}</p>
              <p><strong>Harga Bulanan:</strong> Rp {booking.kamar.hargaBulanan.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p><strong>Check-in:</strong> {booking.tglMulai}</p>
              <p><strong>Check-out:</strong> {booking.tglSelesai}</p>
              <p><strong>Status:</strong> <span className="text-green-600 font-medium">Aktif</span></p>
            </div>
          </div>
          <div className="pt-4 border-t">
            <Link href={`/dashboard/member/pembayaran/${booking.id}`}>
              <Button className="w-full">Bayar Tagihan Bulanan</Button>
            </Link>
            <Link href="/dashboard/member/profil">
              <Button variant="outline" className="w-full mt-2">Edit Profil</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
