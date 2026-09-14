import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberPembayaran() {
  const payments = [
    { id: "p1", booking: { kos: { nama: "Kos Aman Sentosa" }, kamar: { nomor: "A-01" } }, amount: 1500000, status: "SUCCESS", date: "2026-09-05" },
    { id: "p2", booking: { kos: { nama: "Kos Aman Sentosa" }, kamar: { nomor: "A-01" } }, amount: 1500000, status: "PENDING", date: "2026-10-05" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-xl font-semibold">Tagihan & Pembayaran</h2>
      <div className="space-y-4">
        {payments.map((p) => (
          <Card key={p.id} className="border">
            <CardHeader className="flex items-center p-4">
              <div className="flex-1">
                <CardTitle className="text-base">{p.booking.kos.nama} - Kamar {p.booking.kamar.nomor}</CardTitle>
                <p className="text-sm text-muted-foreground">Tagihan Bulanan</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === "SUCCESS" ? "bg-green-100 text-green-800" : p.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                  {p.status === "SUCCESS" ? "Lunas" : p.status === "PENDING" ? "Menunggu" : "Gagal"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <p className="mb-2"><strong>Jumlah:</strong> Rp {p.amount.toLocaleString("id-ID")}</p>
              <p><strong>Tanggal Tagihan:</strong> {p.date}</p>
              {p.status === "PENDING" && (
                <div className="mt-4">
                  <Link href={`/dashboard/member/pembayaran/${p.id}`}>
                    <Button className="w-full">Bayar Sekarang</Button>
                  </Link>
                </div>
              )}
              {p.status === "SUCCESS" && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Bukti Bayar:</strong> <a href="#" className="text-primary hover:underline">Lihat Bukti</a>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
