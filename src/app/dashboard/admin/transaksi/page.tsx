"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const STAT = ["PENDING","SUCCESS","FAILED","REFUNDED"] as const;
const LABEL: Record<string,string> = { PENDING:"Pending", SUCCESS:"Sukses", FAILED:"Gagal", REFUNDED:"Refund" };
const COLOR: Record<string,string> = { PENDING:"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]", SUCCESS:"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]", FAILED:"bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]", REFUNDED:"bg-white border-[#EDE6D6] text-[#6B5E4F]" };
const METHOD_LABEL: Record<string,string> = { VIRTUAL_ACCOUNT:"VA", TRANSFER_BANK:"Transfer", E_WALLET:"E-Wallet", QRIS:"QRIS" };

export default function AdminTransaksi() {
  const [list,setList]=useState<any[]>([]);
  const [q,setQ]=useState("");
  const [fStat,setFStat]=useState("");
  const [msg,setMsg]=useState("");
  const [mockCount,setMockCount]=useState(12);

  const load = async()=>{
    const r=await fetch("/api/admin/transaksi");
    const d=await r.json();
    setList(Array.isArray(d)?d:[]);
  };
  useEffect(()=>{ load(); },[]);

  const filtered = list.filter(t=>{
    if (fStat && t.status!==fStat) return false;
    if (q && !(`${t.invoiceNo||""} ${t.payer?.email||""} ${t.booking?.kos?.nama||""} ${t.booking?.kamar?.nomor||""}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const totalGMV = list.filter(t=>t.status==="SUCCESS").reduce((s,t)=>s+Number(t.amount||0),0);
  const pending = list.filter(t=>t.status==="PENDING").length;

  const mock = async()=>{
    setMsg("Membuat mock transaksi...");
    const r = await fetch("/api/admin/transaksi/mock", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ count: mockCount }) });
    const j = await r.json();
    if (!r.ok) setMsg(j.error||"Gagal mock"); else { setMsg(`✅ ${j.created} mock transaksi dibuat`); load(); }
  };
  const update = async(id:string, status:string)=>{
    const r = await fetch(`/api/admin/transaksi/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status }) });
    const j = await r.json();
    if (!r.ok) setMsg(j.error); else { setMsg(`✅ ${j.invoiceNo||id} → ${LABEL[status]}`); load(); }
  };
  const reset = async()=>{
    if (!confirm("Hapus semua payment mock? marketplace orders tetap.")) return;
    // hapus pending: warning
    setMsg("Gunakan Prisma Studio / DB manual untuk hapus bulk — mock aman dihapus.");
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Monitoring <span className="text-[#C9A96A]">Transaksi</span> <span className="align-middle ml-1 rounded-full bg-[#FFF3E0] border border-[#FFE0B2] px-2 py-0.5 text-xs font-sans font-medium">MOCK</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{list.length} transaksi • GMV sukses Rp {totalGMV.toLocaleString("id-ID")} • {pending} pending • untuk test tampilan</p>
        </div>
        <Link href="/dashboard/admin/marketplace/orders" className="text-xs font-medium text-[#C9A96A] hover:underline">Pesanan marketplace →</Link>
      </div>

      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft bg-[#FFF7ED]/40">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="text-sm font-medium">Buat mock test:</div>
          <Input type="number" min={1} max={20} value={mockCount} onChange={e=>setMockCount(Number(e.target.value)||12)} className="w-20 h-9" />
          <span className="text-xs text-[#8A7D6B]">transaksi (1-20)</span>
          <Button onClick={mock} size="sm" className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">Generate Mock ✨</Button>
          <span className="text-xs text-[#B8A99A]">acak kos/kamar/payer/method/status • invoice unik • booking ikut kebuat</span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#EAF6EC] border border-[#C8E6C9] p-4"><div className="text-xs tracking-widest uppercase text-[#2E7D32]">Sukses</div><div className="serif text-xl">{list.filter(t=>t.status==="SUCCESS").length}</div><div className="text-xs text-[#2E7D32]">Rp {totalGMV.toLocaleString("id-ID")}</div></div>
        <div className="rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] p-4"><div className="text-xs tracking-widest uppercase text-[#8A6D1E]">Pending</div><div className="serif text-xl">{pending}</div><div className="text-xs text-[#8A6D1E]">perlu verifikasi</div></div>
        <div className="rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] p-4"><div className="text-xs tracking-widest uppercase text-[#C62828]">Gagal</div><div className="serif text-xl">{list.filter(t=>t.status==="FAILED").length}</div></div>
      </div>

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari invoice / email / kos..." className="max-w-[240px]" />
          <select value={fStat} onChange={e=>setFStat(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua status</option>
            {STAT.map(s=><option key={s} value={s}>{LABEL[s]}</option>)}
          </select>
          <span className="text-xs text-[#8A7D6B] ml-auto">{filtered.length} hasil</span>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {filtered.map(t=>(
          <Card key={t.id} className="rounded-2xl border-[#EDE6D6] shadow-soft">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-start justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs bg-[#FDFBF7] border border-[#EDE6D6] rounded-lg px-2 py-1">{t.invoiceNo||t.id.slice(0,8)}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLOR[t.status]}`}>{LABEL[t.status]||t.status}</span>
                    <span className="rounded-full bg-white border border-[#E8DCC8] px-2 py-0.5 text-xs">{METHOD_LABEL[t.method]||t.method}</span>
                  </div>
                  <div className="mt-2 font-semibold text-sm truncate">{t.booking?.kos?.nama || t.booking?.kamar?.kos?.nama || "-"} • Kamar {t.booking?.kamar?.nomor || t.booking?.kamarId?.slice(0,6)}</div>
                  <div className="text-xs text-[#8A7D6B]">Payer {t.payer?.name || t.payer?.email} • {t.payer?.email} • Booking {t.bookingId.slice(0,8)}</div>
                  <div className="text-xs text-[#B8A99A]">{new Date(t.createdAt).toLocaleString("id-ID")} {t.verifiedAt ? `• verified ${new Date(t.verifiedAt).toLocaleString("id-ID")}` : ""}</div>
                  {t.buktiBayar && <a href={t.buktiBayar} target="_blank" className="text-xs text-[#C9A96A] underline">Lihat bukti</a>}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#C9A96A]">Rp {Number(t.amount).toLocaleString("id-ID")}</div>
                  <div className="text-xs text-[#8A7D6B]">{t.booking?.durasiBulan || 1} bulan • {t.booking?.status}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.status==="PENDING" && <><Button size="sm" onClick={()=>update(t.id,"SUCCESS")} className="rounded-full bg-[#2E7D32] text-white hover:bg-[#256B29] text-xs">Verifikasi Sukses</Button><Button size="sm" variant="outline" onClick={()=>update(t.id,"FAILED")} className="rounded-full text-xs">Tandai Gagal</Button></>}
                {t.status==="SUCCESS" && <Button size="sm" variant="outline" onClick={()=>update(t.id,"REFUNDED")} className="rounded-full text-xs">Refund</Button>}
                {t.status==="FAILED" && <Button size="sm" variant="outline" onClick={()=>update(t.id,"PENDING")} className="rounded-full text-xs">Kembalikan Pending</Button>}
                {t.status==="REFUNDED" && <Button size="sm" variant="outline" onClick={()=>update(t.id,"PENDING")} className="rounded-full text-xs">Pending lagi</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Belum ada transaksi — klik Generate Mock di atas bro ✨</p>}
      </div>
    </div>
  );
}
