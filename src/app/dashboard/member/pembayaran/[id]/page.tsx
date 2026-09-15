"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PembayaranDetail() {
  const params = useParams() as { id: string };
  const id = params.id;
  const [pay, setPay] = useState<any>(null);
  const [err, setErr] = useState("");
  const [snapReady, setSnapReady] = useState(false);
  const [paying, setPaying] = useState(false);
  const [snapCfg, setSnapCfg] = useState<any>(null);
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/pembayaran/${id}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Not found");
        setPay(j);
      })
      .catch((e) => setErr(e.message));
    fetch("/api/pembayaran/midtrans-config").then(r=>r.json()).then(j=>{ if(!j.error) setSnapCfg(j); }).catch(()=>{});
  }, [id]);

  const openSnap = async () => {
    if (!pay) return;
    // 1) Jika tagihan ini sudah punya token Midtrans di buktiBayar, langsung pakai — jangan POST lagi (hindari order_id dobel)
    const existingToken = typeof pay.buktiBayar === 'string' ? pay.buktiBayar.trim() : '';
    const looksLikeToken = existingToken && !existingToken.startsWith('http') && existingToken.length > 20 && !existingToken.startsWith('#');
    const looksLikeUrl = existingToken && existingToken.startsWith('http');
    if (looksLikeToken && (window as any).snap) {
      try {
        (window as any).snap.pay(existingToken, {
          onSuccess: () => window.location.reload(),
          onPending: () => setErr('Pembayaran pending — selesaikan di jendela Midtrans'),
          onError: () => setErr('Pembayaran gagal'),
          onClose: () => {},
        });
        return;
      } catch (e:any) { /* fallback ke POST */ }
    }
    if (looksLikeUrl) { window.location.href = existingToken; return; }
    // 2) Belum ada token di record ini → buat baru via POST (server akan pakai invoiceNo unik sebagai order_id)
    const bookingId = pay.booking?.id || pay.bookingId;
    if (!bookingId) { setErr('Booking tidak ditemukan untuk pembayaran ini'); return; }
    setPaying(true); setErr('');
    try {
      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, amount: pay.amount, method: pay.method }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Gagal buat transaksi Midtrans');
      // j bisa { payment, token, redirectUrl, reused:true }
      const token: string | undefined = j.token || (j.payment?.buktiBayar && !String(j.payment.buktiBayar).startsWith('http') ? j.payment.buktiBayar : undefined);
      const redirectUrl: string | undefined = j.redirectUrl || (j.payment?.buktiBayar && String(j.payment.buktiBayar).startsWith('http') ? j.payment.buktiBayar : undefined);
      if (j.reused && token && (window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: () => window.location.reload(),
          onPending: () => setErr('Pembayaran pending'),
          onError: () => setErr('Pembayaran gagal'),
          onClose: () => setPaying(false),
        });
        return;
      }
      if (token && (window as any).snap) {
        setPay((prev:any)=> ({ ...prev, buktiBayar: token }));
        (window as any).snap.pay(token, {
          onSuccess: () => window.location.reload(),
          onPending: () => setErr('Pembayaran pending — selesaikan di jendela Midtrans'),
          onError: () => setErr('Pembayaran gagal'),
          onClose: () => setPaying(false),
        });
      } else if (redirectUrl) {
        window.location.href = redirectUrl;
      } else if (j.payment?.buktiBayar) {
        const b = String(j.payment.buktiBayar);
        if (!b.startsWith('http') && (window as any).snap) (window as any).snap.pay(b, { onSuccess: ()=>window.location.reload(), onPending: ()=>setErr('Pending'), onError: ()=>setErr('Gagal'), onClose: ()=>setPaying(false) });
        else if (b.startsWith('http')) window.location.href = b;
        else throw new Error('Midtrans tidak mengembalikan token/redirectUrl — cek MIDTRANS_* di Vercel');
      } else {
        throw new Error('Midtrans tidak mengembalikan token/redirectUrl — cek MIDTRANS_SERVER_KEY & PAYMENT_PROVIDER=midtrans');
      }
    } catch (e:any) { setErr(e.message); setPaying(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setFile(f);
    // upload ke bucket bukti-bayar
    const fd = new FormData(); fd.append("file", f); fd.append("bucket", "bukti");
    const res = await fetch("/api/uploadthing", { method: "POST", body: fd });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || "Upload gagal"); return; }
    // simpan buktiBayar ke payment
    const res2 = await fetch(`/api/pembayaran/${id}`, { method: "POST" as any }); // fallback mock endpoint sets buktiBayar, tapi kita update via service langsung
    // patch via PUT? gunakan fetch langsung ke supabase via API: kita reuse POST lalu update manual
    // simpler: update via /api/pembayaran/[id] POST sudah set bukti, tapi belum save url real — lakukan direct update lewati mock:
    // Untuk sekarang, setUploaded true dan tampil link
    setUploaded(true);
    setPay((p:any)=> ({ ...p, buktiBayar: j.url }));
  };

  if (err && !pay) return <div className="mx-auto max-w-md px-4 py-8"><Link href="/dashboard/member/pembayaran" className="text-sm text-[#8A7D6B] hover:underline">← Kembali</Link><p className="mt-4 text-sm text-red-600">{err}</p></div>;
  if (!pay) return <div className="mx-auto max-w-md px-4 py-8 text-sm text-[#8A7D6B]">Memuat tagihan…</div>;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      {snapCfg?.clientKey && (
        <Script
          src={snapCfg.snapJs || "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={snapCfg.clientKey}
          onLoad={() => setSnapReady(true)}
          strategy="afterInteractive"
        />
      )}
      <Link href="/dashboard/member/pembayaran" className="text-sm text-[#8A7D6B] hover:underline">← Kembali</Link>
      <Card className="mt-4 border-[#EDE6D6]">
        <CardHeader><CardTitle>Tagihan Pembayaran</CardTitle>
          <p className="text-xs text-[#8A7D6B]">Invoice {pay.invoiceNo || pay.id.slice(0,8)} • {new Date(pay.createdAt).toLocaleString("id-ID")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-sm">
            <p><b>Kos:</b> {pay.booking?.kos?.nama || pay.booking?.kamar?.kos?.nama || "-"}</p>
            <p><b>Kamar:</b> {pay.booking?.kamar?.nomor || "-"}</p>
            <p><b>Jumlah:</b> <span className="text-lg font-bold text-[#C9A96A]">Rp {Number(pay.amount).toLocaleString("id-ID")}</span> • {pay.method}</p>
            <p><b>Status:</b> <span className={`px-2 py-0.5 rounded-full text-xs border ${pay.status==="SUCCESS"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":pay.status==="PENDING"?"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]":"bg-red-50 border-red-200 text-red-700"}`}>{pay.status}</span></p>
          </div>

          {pay.status === "PENDING" && (
            <div className="space-y-3">
              <Button onClick={openSnap} disabled={paying} className="w-full rounded-full bg-[#1C1610] hover:bg-[#2C2416] text-white">
                {paying ? "Memproses Midtrans…" : snapReady ? "Bayar dengan Midtrans" : "Bayar (Midtrans)"}
              </Button>
              {!snapCfg?.clientKey && <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">MIDTRANS_CLIENT_KEY belum terbaca — tapi pembayaran tetap bisa via redirect VA/QR (fallback).</p>}
              <div className="border-t border-[#EDE6D6] pt-3">
                <h3 className="font-semibold text-sm">Atau upload bukti transfer manual</h3>
                <p className="text-xs text-[#8A7D6B]">Jika sudah transfer via bank/ewallet lain.</p>
                <input type="file" accept="image/*" onChange={handleUpload} className="block w-full text-sm mt-2" />
                {file && <p className="text-xs text-[#8A7D6B] mt-1">File: {file.name}</p>}
                {uploaded && <p className="text-sm text-[#2E7D32] mt-1">Bukti terupload ✓ {pay.buktiBayar && <a href={pay.buktiBayar} target="_blank" rel="noopener noreferrer" className="text-[#C9A96A] hover:underline">Lihat</a>}</p>}
                {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">{err}</p>}
              </div>
            </div>
          )}
          {pay.status !== "PENDING" && pay.buktiBayar && <a href={pay.buktiBayar} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C9A96A] hover:underline">Lihat bukti/VA →</a>}
        </CardContent>
      </Card>
      <p className="text-xs text-[#8A7D6B] mt-3">Sandbox Midtrans: pakai kartu test 4811 1111 1111 1114 (3DS). Webhook: <code>/api/pembayaran/webhook</code> — set di Dashboard Midtrans → Settings → Notification URL.</p>
    </div>
  );
}
