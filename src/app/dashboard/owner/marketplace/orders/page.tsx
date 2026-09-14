"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LABEL: Record<string,string> = { PENDING:"Pending", CONFIRMED:"Dikonfirmasi", PROCESSING:"Diproses", COMPLETED:"Selesai", CANCELLED:"Dibatalkan", REFUNDED:"Refund" };
const COLOR: Record<string,string> = { PENDING:"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]", CONFIRMED:"bg-[#E3F2FD] border-[#BBDEFB] text-[#1A56DB]", PROCESSING:"bg-[#F3E8FF] border-[#E9D5FF] text-[#7C3AED]", COMPLETED:"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]", CANCELLED:"bg-white border-[#EDE6D6] text-[#8A7D6B]", REFUNDED:"bg-[#FDFBF7] border-[#E8DCC8] text-[#6B5E4F]" };

export default function OwnerMarketplaceOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const load = async()=>{ const r=await fetch("/api/marketplace/orders"); const d=await r.json(); setOrders(Array.isArray(d)?d:[]); };
  useEffect(()=>{ load(); },[]);
  const update = async(id:string, status:string)=>{ const r=await fetch(`/api/marketplace/orders/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); const j=await r.json(); if(!r.ok) setMsg(j.error); else { setMsg(`✅ ${j.service?.nama} → ${LABEL[status]}`); load(); } };
  const pending = orders.filter(o=>o.status==="PENDING").length;

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div>
        <Link href="/dashboard/owner" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Owner</Link>
        <h1 className="serif text-[26px] leading-none mt-1">Pesanan <span className="text-[#C9A96A]">Marketplace</span></h1>
        <p className="text-sm text-[#8A7D6B] mt-1">{orders.length} pesanan untuk kos kamu • {pending} pending perlu aksi</p>
      </div>
      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}
      <div className="space-y-3">
        {orders.map(o=>(
          <Card key={o.id} className="rounded-2xl border-[#EDE6D6] shadow-soft">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <img src={o.service?.foto || `https://picsum.photos/seed/market-${o.serviceId}/80/80`} alt={o.service?.nama} className="h-14 w-14 rounded-xl object-cover border border-[#EDE6D6] shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm truncate">{o.service?.nama}</div>
                  <div className="text-xs text-[#8A7D6B]">Pembeli: {o.buyer?.name||o.buyer?.email} • {o.buyer?.email} • Qty {o.qty} • Rp {o.totalHarga.toLocaleString("id-ID")}</div>
                  {o.catatan && <div className="text-xs bg-[#FDFBF7] border border-[#EDE6D6] rounded-lg px-2 py-1 mt-1">Catatan: {o.catatan}</div>}
                  <div className="text-xs text-[#B8A99A] mt-1">{new Date(o.createdAt).toLocaleString("id-ID")} • {o.service?.kos?.nama || "-"}</div>
                </div>
                <span className={`h-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLOR[o.status]}`}>{LABEL[o.status]||o.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.status==="PENDING" && <Button size="sm" onClick={()=>update(o.id,"CONFIRMED")} className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416] text-xs">Konfirmasi</Button>}
                {["PENDING","CONFIRMED"].includes(o.status) && <Button size="sm" variant="outline" onClick={()=>update(o.id,"PROCESSING")} className="rounded-full text-xs">Proses</Button>}
                {o.status==="PROCESSING" && <Button size="sm" onClick={()=>update(o.id,"COMPLETED")} className="rounded-full bg-[#2E7D32] text-white hover:bg-[#256B29] text-xs">Selesaikan</Button>}
                {!["COMPLETED","CANCELLED","REFUNDED"].includes(o.status) && <Button size="sm" variant="outline" onClick={()=>update(o.id,"CANCELLED")} className="rounded-full text-xs">Batalkan</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Belum ada pesanan untuk jasa kos kamu.</p>}
      </div>
    </div>
  );
}
