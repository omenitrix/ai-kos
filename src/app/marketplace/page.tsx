"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KAT_LABEL: Record<string,string> = { FURNITURE:"Furniture", CLEANING:"Cleaning", LAUNDRY:"Laundry", TEKNISI:"Teknisi", INTERNET:"Internet", CATERING:"Catering", LAINNYA:"Lainnya" };

export default function Marketplace() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [kat, setKat] = useState("");
  const [qtyMap, setQtyMap] = useState<Record<string,number>>({});
  const [catatMap, setCatatMap] = useState<Record<string,string>>({});
  const [msg, setMsg] = useState("");

  const load = async()=>{
    const r = await fetch("/api/marketplace");
    const d = await r.json();
    if (Array.isArray(d)) setItems(d);
    else if (Array.isArray(d.items)) setItems(d.items);
    else setItems([]);
  };
  useEffect(()=>{ load(); },[]);

  const filtered = items.filter(i=>{
    if (kat && i.kategori!==kat) return false;
    if (q && !(`${i.nama} ${i.deskripsi||""} ${i.kategori}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const pesan = async(id:string)=>{
    const qty = Math.max(1, qtyMap[id]||1);
    const catatan = catatMap[id]||"";
    const r = await fetch("/api/marketplace/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ serviceId:id, qty, catatan }) });
    const j = await r.json();
    if (!r.ok) {
      if (r.status===401) { setMsg("Login dulu bro untuk pesan."); router.push("/login"); return; }
      setMsg(j.error||"Gagal memesan");
    } else {
      setMsg(`✅ Pesanan ${j.service?.nama} x${qty} berhasil — Rp ${j.totalHarga.toLocaleString("id-ID")} (pending)`);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="serif text-[30px] leading-none">Marketplace <span className="text-[#C9A96A]">AI-KOS</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-2 max-w-[560px]">Furniture, cleaning, laundry, teknisi, internet, catering — langsung dari penyedia terpercaya. Pesan seperti marketplace pada umumnya, tracking pesanan di dashboard.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/member/marketplace/orders" className="rounded-full border border-[#E8DCC8] bg-white px-4 py-2 text-xs font-medium hover:bg-[#FDFBF7]">Pesanan Saya →</Link>
          <Link href="/kos/cari" className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium hover:bg-[#2C2416]">Cari Kos →</Link>
        </div>
      </div>

      {msg && <div className="rounded-2xl bg-[#FFF7ED] border border-[#FFE0B2] px-4 py-3 text-sm">{msg}</div>}

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari: setrika, cleaning, internet..." className="max-w-[260px]" />
          <select value={kat} onChange={e=>setKat(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua kategori</option>
            {Object.entries(KAT_LABEL).map(([k,v])=><option key={k} value={k}>{v}</option>)}
          </select>
          <span className="text-xs text-[#8A7D6B] ml-auto">{filtered.length} layanan</span>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item:any) => (
          <Card key={item.id} className="overflow-hidden rounded-2xl border-[#EDE6D6] shadow-soft">
            <img src={item.foto || `https://picsum.photos/seed/market-${item.id}/400/260`} alt={item.nama} className="h-44 w-full object-cover" />
            <CardContent className="p-4 space-y-3">
              <div>
                <CardTitle className="text-[15px] leading-tight">{item.nama}</CardTitle>
                <CardDescription className="text-xs text-[#8A7D6B] mt-1">{KAT_LABEL[item.kategori]||item.kategori} {item.kos?.nama? `• ${item.kos.nama}`:""}</CardDescription>
                {item.deskripsi && <p className="text-xs text-[#6B5E4F] mt-2 line-clamp-2">{item.deskripsi}</p>}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#C9A96A]">Rp {item.harga.toLocaleString("id-ID")}</span>
                {item.stok!=null && <span className="text-xs text-[#8A7D6B]">Stok {item.stok}</span>}
              </div>
              <div className="flex gap-2">
                <div className="flex items-center rounded-xl border border-[#E8DCC8] bg-white overflow-hidden shrink-0">
                  <button onClick={()=>setQtyMap(m=>({...m,[item.id]:Math.max(1,(m[item.id]||1)-1)}))} className="px-2.5 py-1.5 text-sm hover:bg-[#FDFBF7]">−</button>
                  <span className="px-2 text-sm font-medium min-w-[28px] text-center">{qtyMap[item.id]||1}</span>
                  <button onClick={()=>setQtyMap(m=>({...m,[item.id]:(m[item.id]||1)+1}))} className="px-2.5 py-1.5 text-sm hover:bg-[#FDFBF7]">+</button>
                </div>
                <Input value={catatMap[item.id]||""} onChange={e=>setCatatMap(m=>({...m,[item.id]:e.target.value}))} placeholder="Catatan (opsional)" className="h-9 text-xs flex-1" />
              </div>
              <Button onClick={()=>pesan(item.id)} size="sm" className="w-full rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">Pesan Sekarang</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Tidak ada layanan untuk filter ini.</p>}
    </div>
  );
}
