"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MemberPembayaran() {
  const [list, setList] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/pembayaran")
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Gagal memuat pembayaran");
        setList(Array.isArray(j) ? j : []);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-[#8A7D6B]">Memuat tagihan…</div>;
  if (err) return <div className="mx-auto max-w-6xl px-4 py-8"><p className="text-sm text-red-600">{err} — login sebagai MEMBER.</p><Link href="/dashboard/member" className="text-sm text-[#C9A96A] hover:underline">← Dashboard</Link></div>;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="serif text-[22px]">Tagihan & Pembayaran</h2>
        <Link href="/dashboard/member/penyewaan" className="text-sm text-[#8A7D6B] hover:underline">Lihat penyewaan →</Link>
      </div>
      {list.length === 0 ? (
        <Card className="border-[#EDE6D6]"><CardContent className="py-10 text-center text-sm text-[#8A7D6B]">Belum ada tagihan. Buat booking di <Link href="/kos/cari" className="text-[#C9A96A] font-medium">Cari Kos</Link>.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {list.map((p: any) => (
            <Card key={p.id} className="border-[#EDE6D6]">
              <CardHeader className="flex flex-row items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{p.booking?.kos?.nama || p.booking?.kamar?.kos?.nama || "Kos"} - Kamar {p.booking?.kamar?.nomor || p.booking?.kamarId?.slice(0,4) || "-"}</CardTitle>
                  <p className="text-sm text-[#8A7D6B]">Invoice {p.invoiceNo || p.id.slice(0,8)} • {p.method}</p>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs border ${p.status === "SUCCESS" ? "bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]" : p.status === "PENDING" ? "bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]" : "bg-red-50 border-red-200 text-red-700"}`}>{p.status}</span>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm"><b>Jumlah:</b> Rp {Number(p.amount).toLocaleString("id-ID")}</p>
                <p className="text-xs text-[#8A7D6B]">{new Date(p.createdAt).toLocaleString("id-ID")}</p>
                {p.buktiBayar && <p className="text-xs mt-1"><b>Bukti/VA:</b> <span className="break-all">{p.buktiBayar}</span></p>}
                {p.status === "PENDING" && (
                  <Link href={`/dashboard/member/pembayaran/${p.id}`} className="block mt-3"><Button className="w-full rounded-full bg-[#1C1610] hover:bg-[#2C2416] text-white">Bayar Sekarang</Button></Link>
                )}
                {p.status === "SUCCESS" && p.buktiBayar && <a href={p.buktiBayar} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A96A] hover:underline mt-2 inline-block">Lihat bukti →</a>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
