"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LABEL: Record<string,string> = { PENDING:"Pending", CONFIRMED:"Dikonfirmasi", PROCESSING:"Diproses", COMPLETED:"Selesai", CANCELLED:"Dibatalkan", REFUNDED:"Refund" };
const COLOR: Record<string,string> = { PENDING:"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]", CONFIRMED:"bg-[#E3F2FD] border-[#BBDEFB] text-[#1A56DB]", PROCESSING:"bg-[#F3E8FF] border-[#E9D5FF] text-[#7C3AED]", COMPLETED:"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]", CANCELLED:"bg-white border-[#EDE6D6] text-[#8A7D6B]", REFUNDED:"bg-[#FDFBF7] border-[#E8DCC8] text-[#6B5E4F]" };

export default function MemberOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const load = async()=>{ const r=await fetch("/api/marketplace/orders"); const d=await r.json(); setOrders(Array.isArray(d)?d:[]); };
  useEffect(()=>{ load(); },[]);
  const cancel = async(id:string)=>{ const r=await fetch(`/api/marketplace/orders/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status:"CANCELLED"})}); const j=await r.json(); if(!r.ok) setMsg(j.error); else { setMsg("✅ Dibatalkan"); load(); } };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex items-end justify-between">
        <div>
          <Link href="/marketplace" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Marketplace</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Pesanan <span className="text-[#C9A96A]">Saya</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{orders.length} pesanan marketplace kamu</p>
        </div>
        <Link href="/marketplace" className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium">Belanja lagi →</Link>
      </div>
      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}
      <div className="space-y-3">
        {orders.map(o=>(
          <Card key={o.id} className="rounded-2xl border-[#EDE6D6] shadow-soft">
            <CardContent className="p-4 flex gap-3">
              <Image src={o.service?.foto || `https://picsum.photos/seed/market-${o.serviceId}/80/80`} alt={o.service?.nama || "marketplace"} width={80} height={80} className="h-14 w-14 rounded-xl object-cover border border-[#EDE6D6] shrink-0" unoptimized />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm truncate">{o.service?.nama}</div>
                <div className="text-xs text-[#8A7D6B]">{o.service?.kategori} • Qty {o.qty} • {new Date(o.createdAt).toLocaleString("id-ID")}</div>
                {o.catatan && <div className="text-xs bg-[#FDFBF7] border border-[#EDE6D6] rounded-lg px-2 py-1 mt-1">Catatan: {o.catatan}</div>}
                <div className="mt-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${COLOR[o.status]}`}>{LABEL[o.status]||o.status}</span>
                  <span className="font-bold text-[#C9A96A] text-sm">Rp {o.totalHarga.toLocaleString("id-ID")}</span>
                </div>
              </div>
              <div className="shrink-0">
                {o.status==="PENDING" && <Button size="sm" variant="outline" onClick={()=>cancel(o.id)} className="rounded-full text-xs">Batalkan</Button>}
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Belum ada pesanan. Mulai dari <Link href="/marketplace" className="text-[#C9A96A] font-medium">Marketplace</Link>.</p>}
      </div>
    </div>
  );
}
