"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberActiveBooking() {
  const [booking, setBooking] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const bRes = await fetch("/api/penyewaan");
        const bJson = await bRes.json();
        if (!bRes.ok) throw new Error(bJson.error || "Gagal memuat penyewaan");
        const list = Array.isArray(bJson) ? bJson : [];
        const active = list.find((x: any) => x.status === "ACTIVE" || x.status === "PENDING_PAYMENT" || x.status === "DRAFT") || list[0] || null;
        setBooking(active);
        if (active) {
          const pRes = await fetch("/api/pembayaran");
          const pJson = await pRes.json();
          const pays = Array.isArray(pJson) ? pJson : [];
          const pay = pays.find((p: any) => p.bookingId === active.id) || null;
          setPayment(pay);
        }
      } catch (e: any) { setErr(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleBayar = async () => {
    if (!booking) return;
    if (payment) { window.location.href = `/dashboard/member/pembayaran/${payment.id}`; return; }
    setPaying(true); setErr("");
    try {
      const res = await fetch("/api/pembayaran", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId: booking.id, amount: booking.totalHarga }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Gagal membuat tagihan");
      const pid = j.payment?.id || j.id;
      if (pid) window.location.href = `/dashboard/member/pembayaran/${pid}`;
    } catch (e: any) { setErr(e.message); setPaying(false); }
  };

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-[#8A7D6B]">Memuat kontrak…</div>;
  if (err && !booking) return <div className="mx-auto max-w-4xl px-4 py-8"><Link href="/dashboard/member/penyewaan" className="text-sm text-[#8A7D6B] hover:underline">← Kembali</Link><p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p></div>;
  if (!booking) return <div className="mx-auto max-w-4xl px-4 py-8"><Link href="/dashboard/member/penyewaan" className="text-sm text-[#8A7D6B] hover:underline">← Kembali</Link><Card className="mt-4 border-[#EDE6D6]"><CardContent className="py-10 text-center text-sm text-[#8A7D6B]">Belum ada kontrak aktif. Booking dulu di <Link href="/kos/cari" className="text-[#C9A96A]">Cari Kos</Link>.</CardContent></Card></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/dashboard/member/penyewaan" className="text-sm text-[#8A7D6B] hover:underline">← Kembali ke Riwayat</Link>
      <h1 className="mt-2 text-2xl font-bold">Kontrak Sewa Aktif</h1>
      {err && <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <Card className="mt-4 border-[#EDE6D6]">
        <CardHeader><CardTitle className="text-base">{booking.kos?.nama || "-"}</CardTitle><p className="text-sm text-[#8A7D6B]">{booking.kos?.alamat || ""}</p></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div><p><b>Kamar:</b> {booking.kamar?.nomor || booking.kamarId?.slice(0,6) || "-"}</p><p><b>Harga Bulanan:</b> Rp {Number(booking.kamar?.hargaBulanan || booking.totalHarga || 0).toLocaleString("id-ID")}</p><p><b>Total Tagihan:</b> Rp {Number(booking.totalHarga).toLocaleString("id-ID")}</p></div>
            <div><p><b>Check-in:</b> {new Date(booking.tglMulai).toLocaleDateString("id-ID")}</p><p><b>Check-out:</b> {booking.tglSelesai ? new Date(booking.tglSelesai).toLocaleDateString("id-ID") : `durasi ${booking.durasiBulan || 1} bulan`}</p><p><b>Status:</b> <span className={`px-2 py-0.5 rounded-full text-xs border ${booking.status==="ACTIVE"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":booking.status==="PENDING_PAYMENT"?"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]":"bg-[#F5F5F5] border-[#EDE6D6] text-[#8A7D6B]"}`}>{booking.status}</span>{payment && <span className="ml-2 text-xs">Tagihan: {payment.status}</span>}</p></div>
          </div>
          <div className="pt-4 border-t border-[#EDE6D6] space-y-2">
            {payment ? (
              <Link href={`/dashboard/member/pembayaran/${payment.id}`} className="block"><Button className={`w-full rounded-full ${payment.status==="PENDING"?"bg-[#1C1610] hover:bg-[#2C2416] text-white":""}`} variant={payment.status==="PENDING"?"default":"outline"}>{payment.status==="PENDING"?"Lanjutkan Bayar — Midtrans":"Lihat Tagihan"}</Button></Link>
            ) : (
              <Button onClick={handleBayar} disabled={paying} className="w-full rounded-full bg-[#1C1610] hover:bg-[#2C2416] text-white">{paying?"Membuat tagihan…":"Bayar Tagihan — Midtrans"}</Button>
            )}
            <Link href="/dashboard/member/pembayaran" className="block"><Button variant="outline" className="w-full rounded-full">Lihat Semua Tagihan</Button></Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
