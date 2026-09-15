"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Booking = any;

export default function MemberPenyewaan() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const [bRes, pRes] = await Promise.all([fetch("/api/penyewaan"), fetch("/api/pembayaran")]);
      const bJson = await bRes.json();
      const pJson = await pRes.json();
      if (!bRes.ok) throw new Error(bJson.error || "Gagal memuat penyewaan");
      setBookings(Array.isArray(bJson) ? bJson : []);
      setPayments(Array.isArray(pJson) ? pJson : []);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const paymentByBooking = new Map(payments.map((p: any) => [p.bookingId, p]));
  // pending payment first
  const handleBayar = async (b: Booking) => {
    const existing = paymentByBooking.get(b.id);
    if (existing && existing.status === "PENDING") {
      window.location.href = `/dashboard/member/pembayaran/${existing.id}`;
      return;
    }
    if (existing && existing.status === "SUCCESS") {
      setErr("Tagihan booking ini sudah lunas.");
      return;
    }
    setPayingId(b.id); setErr("");
    try {
      const res = await fetch("/api/pembayaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: b.id, amount: b.totalHarga, method: "VIRTUAL_ACCOUNT" }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Gagal membuat tagihan");
      const pid = j.payment?.id || j.id;
      if (pid) window.location.href = `/dashboard/member/pembayaran/${pid}`;
      else window.location.href = "/dashboard/member/pembayaran";
    } catch (e: any) { setErr(e.message); setPayingId(null); }
  };

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#8A7D6B]">Memuat penyewaan…</div>;
  if (err && bookings.length === 0) return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>
      <Button variant="outline" className="mt-3 rounded-full" onClick={load}>Coba lagi</Button>
      <p className="text-xs text-[#8A7D6B] mt-3">Pastikan login sebagai MEMBER.</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Riwayat Penyewaan</h2>
        <Link href="/dashboard/member/pembayaran" className="text-sm text-[#C9A96A] hover:underline">Tagihan & Pembayaran →</Link>
      </div>
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">{err}</p>}
      {bookings.length === 0 ? (
        <Card className="border-[#EDE6D6]"><CardContent className="py-10 text-center text-sm text-[#8A7D6B]">
          Belum ada penyewaan. Cari kos di <Link href="/kos/cari" className="text-[#C9A96A] font-medium">Cari Kos</Link> lalu booking.
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => {
            const pay = paymentByBooking.get(b.id);
            const kamarNo = b.kamar?.nomor || b.kamarId?.slice(0, 6) || "-";
            const kosNama = b.kos?.nama || b.kamar?.kos?.nama || "Kos";
            return (
              <Card key={b.id} className="border-[#EDE6D6]">
                <CardHeader className="flex flex-row items-center p-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">{kosNama}</CardTitle>
                    <p className="text-sm text-[#8A7D6B]">Kamar {kamarNo} • {new Date(b.tglMulai).toLocaleDateString("id-ID")} {b.tglSelesai ? ` s/d ${new Date(b.tglSelesai).toLocaleDateString("id-ID")}` : "• durasi " + (b.durasiBulan || 1) + " bulan"} • Rp {Number(b.totalHarga).toLocaleString("id-ID")}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs border ${b.status === "ACTIVE" ? "bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]" : b.status === "PENDING_PAYMENT" ? "bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]" : b.status === "DRAFT" ? "bg-[#F3E8FF] border-[#E9D5FF] text-[#6B21A8]" : "bg-[#F5F5F5] border-[#EDE6D6] text-[#8A7D6B]"}`}>{b.status}</span>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-wrap gap-2">
                  {pay ? (
                    <>
                      <span className={`text-xs px-2 py-1 rounded-full border ${pay.status === "SUCCESS" ? "bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]" : pay.status === "PENDING" ? "bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]" : "bg-red-50 border-red-200 text-red-700"}`}>Tagihan: {pay.status} • {pay.invoiceNo || pay.id.slice(0, 8)}</span>
                      <Link href={`/dashboard/member/pembayaran/${pay.id}`}><Button size="sm" variant="outline" className="rounded-full">{pay.status === "PENDING" ? "Lanjutkan Bayar" : "Lihat Tagihan"}</Button></Link>
                    </>
                  ) : (
                    <Button onClick={() => handleBayar(b)} disabled={payingId === b.id} size="sm" className="rounded-full bg-[#1C1610] hover:bg-[#2C2416] text-white">
                      {payingId === b.id ? "Membuat tagihan…" : (b.status === "DRAFT" || b.status === "PENDING_PAYMENT") ? "Bayar Tagihan" : "Buat Tagihan"}
                    </Button>
                  )}
                  {b.status === "ACTIVE" && <Link href="/dashboard/member/penyewaan/aktif"><Button size="sm" variant="outline" className="rounded-full">Kontrak Aktif</Button></Link>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
