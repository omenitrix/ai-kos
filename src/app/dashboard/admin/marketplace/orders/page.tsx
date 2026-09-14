"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const STATUS = ["PENDING","CONFIRMED","PROCESSING","COMPLETED","CANCELLED","REFUNDED"] as const;
const STATUS_LABEL: Record<string,string> = { PENDING:"Pending", CONFIRMED:"Dikonfirmasi", PROCESSING:"Diproses", COMPLETED:"Selesai", CANCELLED:"Dibatalkan", REFUNDED:"Refund" };
const STATUS_COLOR: Record<string,string> = { PENDING:"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]", CONFIRMED:"bg-[#E3F2FD] border-[#BBDEFB] text-[#1A56DB]", PROCESSING:"bg-[#F3E8FF] border-[#E9D5FF] text-[#7C3AED]", COMPLETED:"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]", CANCELLED:"bg-white border-[#EDE6D6] text-[#8A7D6B]", REFUNDED:"bg-[#FDFBF7] border-[#E8DCC8] text-[#6B5E4F]" };

export default function AdminMarketplaceOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const r = await fetch("/api/marketplace/orders");
    const d = await r.json();
    setOrders(Array.isArray(d)?d:[]);
  };
  useEffect(()=>{ load(); },[]);

  const filtered = orders.filter(o=>{
    if (filter && o.status!==filter) return false;
    if (q && !(`${o.service?.nama} ${o.buyer?.email} ${o.buyer?.name} ${o.service?.kos?.nama||""}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  const stats = {
    pending: orders.filter(o=>o.status==="PENDING").length,
    processing: orders.filter(o=>["CONFIRMED","PROCESSING"].includes(o.status)).length,
    completed: orders.filter(o=>o.status==="COMPLETED").length,
  };

  const updateStatus = async (id:string, status:string) => {
    const r = await fetch(`/api/marketplace/orders/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ status }) });
    const j = await r.json();
    if (!r.ok) setMsg(j.error||"Gagal"); else { setMsg(`✅ Pesanan ${j.service?.nama} → ${STATUS_LABEL[status]}`); load(); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/admin/marketplace" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Kelola Marketplace</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Pesanan <span className="text-[#C9A96A]">Marketplace</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{orders.length} pesanan • {stats.pending} pending • {stats.processing} diproses • {stats.completed} selesai</p>
        </div>
        <Link href="/marketplace" className="rounded-full border border-[#E8DCC8] bg-white px-4 py-2 text-xs font-medium">Lihat store →</Link>
      </div>

      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] p-4"><div className="text-xs tracking-widest uppercase text-[#8A6D1E]">Pending</div><div className="serif text-2xl">{stats.pending}</div></div>
        <div className="rounded-2xl bg-[#F3E8FF] border border-[#E9D5FF] p-4"><div className="text-xs tracking-widest uppercase text-[#7C3AED]">Diproses</div><div className="serif text-2xl">{stats.processing}</div></div>
        <div className="rounded-2xl bg-[#EAF6EC] border border-[#C8E6C9] p-4"><div className="text-xs tracking-widest uppercase text-[#2E7D32]">Selesai</div><div className="serif text-2xl">{stats.completed}</div></div>
      </div>

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari layanan / pembeli / kos..." className="max-w-[260px]" />
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua status</option>
            {STATUS.map(s=><option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <span className="text-xs text-[#8A7D6B] ml-auto">{filtered.length} hasil</span>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {filtered.map(o=>(
          <Card key={o.id} className="rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-start justify-between">
                <div className="flex gap-3 min-w-0 flex-1">
                  <Image src={o.service?.foto || `https://picsum.photos/seed/market-${o.serviceId}/80/80`} alt={o.service?.nama || "marketplace"} width={80} height={80} className="h-14 w-14 rounded-xl object-cover border border-[#EDE6D6] shrink-0" unoptimized />
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{o.service?.nama}</div>
                    <div className="text-xs text-[#8A7D6B] truncate">{o.service?.kategori} • {o.service?.kos?.nama || (o.service?.kosId?"Kos terhubung":"Tanpa kos")} • Qty {o.qty} × Rp {o.service?.harga?.toLocaleString("id-ID")}</div>
                    <div className="text-xs text-[#8A7D6B]">Pembeli: <span className="font-medium text-[#1C1610]">{o.buyer?.name||o.buyer?.email}</span> • {o.buyer?.email} {o.buyer?.phone? `• ${o.buyer.phone}`:""}</div>
                    {o.catatan && <div className="text-xs bg-[#FDFBF7] border border-[#EDE6D6] rounded-lg px-2 py-1 mt-1">Catatan: {o.catatan}</div>}
                    <div className="text-xs text-[#B8A99A] mt-1">{new Date(o.createdAt).toLocaleString("id-ID")}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#C9A96A]">Rp {o.totalHarga.toLocaleString("id-ID")}</div>
                  <span className={`inline-block mt-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status]||"bg-white border-[#EDE6D6]"}`}>{STATUS_LABEL[o.status]||o.status}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.status==="PENDING" && <Button size="sm" onClick={()=>updateStatus(o.id,"CONFIRMED")} className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416] text-xs">Konfirmasi</Button>}
                {["PENDING","CONFIRMED"].includes(o.status) && <Button size="sm" variant="outline" onClick={()=>updateStatus(o.id,"PROCESSING")} className="rounded-full text-xs">Proses</Button>}
                {o.status==="PROCESSING" && <Button size="sm" onClick={()=>updateStatus(o.id,"COMPLETED")} className="rounded-full bg-[#2E7D32] text-white hover:bg-[#256B29] text-xs">Selesaikan</Button>}
                {!["COMPLETED","CANCELLED","REFUNDED"].includes(o.status) && <Button size="sm" variant="outline" onClick={()=>updateStatus(o.id,"CANCELLED")} className="rounded-full text-xs">Batalkan</Button>}
                {o.status==="CANCELLED" && <Button size="sm" variant="outline" onClick={()=>updateStatus(o.id,"REFUNDED")} className="rounded-full text-xs">Refund</Button>}
                {o.status!=="PENDING" && <Button size="sm" variant="outline" onClick={()=>updateStatus(o.id,"PENDING")} className="rounded-full text-xs">Kembalikan Pending</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Belum ada pesanan marketplace.</p>}
      </div>
    </div>
  );
}
