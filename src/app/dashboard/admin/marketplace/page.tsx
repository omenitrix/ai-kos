"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KATEGORI = ["FURNITURE","CLEANING","LAUNDRY","TEKNISI","INTERNET","CATERING","LAINNYA"] as const;

export default function AdminMarketplace() {
  const [items, setItems] = useState<any[]>([]);
  const [kosList, setKosList] = useState<any[]>([]);
  const [filterKat, setFilterKat] = useState("");
  const [q, setQ] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ kosId:"", nama:"", deskripsi:"", harga:"", kategori:"LAINNYA", isActive:true });

  const load = async () => {
    const r = await fetch("/api/marketplace");
    const d = await r.json();
    setItems(Array.isArray(d)?d:d.data||[]);
  };
  const loadKos = async () => {
    const r = await fetch("/api/kos?limit=100");
    const d = await r.json();
    setKosList(Array.isArray(d)?d:[]);
  };
  useEffect(()=>{ load(); loadKos(); },[]);

  const filtered = items.filter(i=>{
    if (filterKat && i.kategori!==filterKat) return false;
    if (showActiveOnly && !i.isActive) return false;
    if (q && !(`${i.nama} ${i.kategori} ${i.kos?.nama||""}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  const startCreate = () => {
    setEditing(null);
    setForm({ kosId: kosList[0]?.id||"", nama:"", deskripsi:"", harga:"", kategori:"LAINNYA", isActive:true });
    setMsg("");
  };
  const startEdit = (it:any) => {
    setEditing(it);
    setForm({ kosId: it.kosId||"", nama: it.nama, deskripsi: it.deskripsi||"", harga: String(it.harga), kategori: it.kategori, isActive: it.isActive });
    setMsg("");
    window.scrollTo({top:0, behavior:"smooth"});
  };
  const submit = async (e:any) => {
    e.preventDefault();
    if (!form.kosId) { setMsg("Pilih kos dulu bro"); return; }
    if (!form.nama || !form.harga) { setMsg("Nama & harga wajib"); return; }
    const payload = { kosId: form.kosId, nama: form.nama, deskripsi: form.deskripsi||null, harga: Number(form.harga), kategori: form.kategori, isActive: form.isActive };
    const url = editing ? `/api/marketplace/${editing.id}` : "/api/marketplace";
    const method = editing ? "PUT" : "POST";
    const r = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error||"Gagal"); return; }
    setMsg(editing ? "✅ Updated" : "✅ Dibuat");
    setEditing(null);
    load();
  };
  const toggleAktif = async (it:any) => {
    const r = await fetch(`/api/marketplace/${it.id}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ isActive: !it.isActive }) });
    if (r.ok) load(); else { const j=await r.json(); setMsg(j.error||"Gagal toggle"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Marketplace <span className="text-[#C9A96A]">— Kelola</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{items.length} item total • {items.filter(i=>i.isActive).length} aktif • {items.filter(i=>!i.isActive).length} nonaktif</p>
        </div>
        <Button onClick={startCreate} className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">+ Tambah Jasa</Button>
      </div>

      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}

      {/* form create/edit */}
      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardHeader className="pb-2"><CardTitle className="text-sm">{editing?`Edit: ${editing.nama}`:"Tambah Jasa / Produk Baru"}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs">Kos terkait *</Label>
              <select value={form.kosId} onChange={e=>setForm({...form,kosId:e.target.value})} className="w-full rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
                <option value="">— pilih kos —</option>
                {kosList.map((k:any)=><option key={k.id} value={k.id}>{k.nama} • {k.alamat}</option>)}
              </select>
              <p className="text-[11px] text-[#B8A99A] mt-1">Admin bisa pilih kos mana pun — owner cuma kos miliknya.</p>
            </div>
            <div>
              <Label className="text-xs">Nama *</Label>
              <Input value={form.nama} onChange={e=>setForm({...form,nama:e.target.value})} placeholder="Misal: Laundry Express 24 Jam" />
            </div>
            <div>
              <Label className="text-xs">Harga (Rp) *</Label>
              <Input type="number" value={form.harga} onChange={e=>setForm({...form,harga:e.target.value})} placeholder="25000" />
            </div>
            <div>
              <Label className="text-xs">Kategori</Label>
              <select value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})} className="w-full rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
                {KATEGORI.map(k=><option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm border border-[#E8DCC8] rounded-xl px-3 py-2.5 bg-[#FDFBF7] w-full">
                <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form,isActive:e.target.checked})} />
                Aktif tampil di marketplace
              </label>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Deskripsi</Label>
              <Input value={form.deskripsi} onChange={e=>setForm({...form,deskripsi:e.target.value})} placeholder="Unlimited bulanan, antar-jemput gratis..." />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" className="rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">{editing?"Simpan Perubahan":"Buat Jasa"}</Button>
              {editing && <Button type="button" variant="outline" onClick={()=>{setEditing(null); setMsg("");}} className="rounded-full">Batal</Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* filter */}
      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama/kos/kategori..." className="max-w-[260px]" />
          <select value={filterKat} onChange={e=>setFilterKat(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua kategori</option>
            {KATEGORI.map(k=><option key={k} value={k}>{k}</option>)}
          </select>
          <label className="flex items-center gap-2 text-xs border border-[#E8DCC8] rounded-full px-3 py-2 bg-[#FDFBF7]">
            <input type="checkbox" checked={showActiveOnly} onChange={e=>setShowActiveOnly(e.target.checked)} /> Hanya aktif
          </label>
          <span className="text-xs text-[#8A7D6B] ml-auto">{filtered.length} hasil</span>
        </CardContent>
      </Card>

      {/* grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((it:any)=>(
          <Card key={it.id} className={`overflow-hidden rounded-2xl border-[#EDE6D6] shadow-soft ${!it.isActive?"opacity-60":""}`}>
            <img src={it.foto || `https://picsum.photos/seed/market-${it.id}/400/250`} alt={it.nama} className="h-44 w-full object-cover" />
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-sm leading-tight">{it.nama}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[11px] border font-medium ${it.isActive?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":"bg-white border-[#EDE6D6] text-[#8A7D6B]"}`}>{it.isActive?"Aktif":"Nonaktif"}</span>
              </div>
              <p className="text-xs text-[#8A7D6B] line-clamp-2">{it.deskripsi||"-"}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded-full bg-[#FDFBF7] border border-[#EDE6D6] px-2 py-0.5 font-medium tracking-widest uppercase text-[#8A7D6B]">{it.kategori}</span>
                {it.kos && <span className="text-[#8A7D6B] truncate">• {it.kos.nama}</span>}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-[#C9A96A]">Rp {it.harga.toLocaleString("id-ID")}</span>
                <span className="text-xs text-[#8A7D6B]">{it.stok!=null?`Stok ${it.stok}`:""}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={()=>startEdit(it)} className="rounded-full flex-1 text-xs">Edit</Button>
                <Button size="sm" onClick={()=>toggleAktif(it)} className={`rounded-full flex-1 text-xs ${it.isActive?"bg-white border border-[#E8DCC8] text-[#2C2416] hover:bg-[#FDFBF7]":"bg-[#1C1610] text-white hover:bg-[#2C2416]"}`}>{it.isActive?"Nonaktifkan":"Aktifkan"}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-8">Tidak ada item sesuai filter.</p>}
      <p className="text-center text-[11px] tracking-widest uppercase text-[#B8A99A]">Admin marketplace • kelola jasa kos • moderasi aktif/nonaktif</p>
    </div>
  );
}
