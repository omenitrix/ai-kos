"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminOwners() {
  const [list,setList]=useState<any[]>([]);
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("");
  const [msg,setMsg]=useState("");
  const [resetId,setResetId]=useState<string|null>(null);
  const [resetVal,setResetVal]=useState("");
  const [showPass,setShowPass]=useState(false);

  const load = useCallback(async()=>{
    const p=new URLSearchParams();
    if(q) p.set("q",q);
    if(status) p.set("status",status);
    const r=await fetch("/api/admin/owners?"+p.toString());
    const d=await r.json();
    setList(Array.isArray(d)?d:[]);
  },[q,status]);
  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{ const t=setTimeout(load,300); return ()=>clearTimeout(t); },[load]);

  const action = async(ownerId:string, data:any)=>{
    const r=await fetch("/api/admin/owners",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ownerId,...data})});
    const j=await r.json();
    if(!r.ok) setMsg(j.error||"Gagal"); else { setMsg(`✅ ${j.email} updated`); load(); }
  };
  const doReset = async(id:string)=>{
    if (!resetVal || resetVal.length < 6) { setMsg("Password baru minimal 6 karakter"); return; }
    const r=await fetch(`/api/admin/users/${id}/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({newPassword: resetVal})});
    const j=await r.json();
    if(!r.ok) setMsg(j.error||"Gagal reset"); else { setMsg(`✅ ${j.message}`); setResetId(null); setResetVal(""); }
  };
  const doDelete = async(id:string, email:string)=>{
    if (!confirm(`Hapus owner ${email}? Owner dengan kos tidak bisa dihapus.`)) return;
    const r=await fetch(`/api/admin/users/${id}`,{method:"DELETE"});
    const j=await r.json();
    if(!r.ok) setMsg(j.error||"Gagal hapus"); else { setMsg(`✅ ${email} dihapus`); load(); }
  };

  const stats={ total:list.length, verified:list.filter(o=>o.isVerified).length, unverified:list.filter(o=>!o.isVerified).length, suspended:list.filter(o=>o.isSuspended).length, kos:list.reduce((s,o)=>s+(o.kosCount||0),0), pending:list.reduce((s,o)=>s+(o.kosPending||0),0) };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Kelola <span className="text-[#C9A96A]">Owner</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{stats.total} owner • {stats.verified} verified • {stats.unverified} unverified • {stats.suspended} suspended • {stats.kos} kos • {stats.pending} pending approval</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/users" className="rounded-full border border-[#E8DCC8] bg-white px-4 py-2 text-xs font-medium hover:bg-[#FDFBF7]">Kelola User →</Link>
          <Link href="/dashboard/admin/listings" className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs font-medium hover:bg-[#2C2416]">Approval →</Link>
        </div>
      </div>

      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4"><div className="text-xs tracking-widest uppercase text-[#B8A99A]">Total Owner</div><div className="serif text-xl">{stats.total}</div></div>
        <div className="rounded-2xl bg-[#EAF6EC] border border-[#C8E6C9] p-4"><div className="text-xs tracking-widest uppercase text-[#2E7D32]">Verified</div><div className="serif text-xl">{stats.verified}</div></div>
        <div className="rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] p-4"><div className="text-xs tracking-widest uppercase text-[#8A6D1E]">Unverified</div><div className="serif text-xl">{stats.unverified}</div></div>
        <div className="rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] p-4"><div className="text-xs tracking-widest uppercase text-[#C62828]">Pending Kos</div><div className="serif text-xl">{stats.pending}</div></div>
      </div>

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama / email / username / phone..." className="max-w-[260px]" />
          <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="active">Aktif</option>
            <option value="suspended">Suspended</option>
          </select>
          <span className="text-xs text-[#8A7D6B] ml-auto">{list.length} hasil</span>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {list.map(o=>(
          <Card key={o.id} className="rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
            <CardContent className="p-4 flex gap-3 items-start">
              <img src={o.photo || `https://picsum.photos/seed/owner-${o.id}/80/80`} alt={o.email} className="h-11 w-11 rounded-xl object-cover border border-[#EDE6D6] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm truncate">{o.name||o.email}</span>
                  <span className="rounded-full bg-[#FFF3E0] border border-[#FFE0B2] px-2 py-0.5 text-xs font-medium text-[#8A6D1E]">OWNER</span>
                  {o.isVerified ? <span className="rounded-full bg-[#EAF6EC] border border-[#C8E6C9] px-2 py-0.5 text-xs text-[#2E7D32]">✓ Verified</span> : <span className="rounded-full bg-white border border-[#EDE6D6] px-2 py-0.5 text-xs text-[#8A7D6B]">Unverified</span>}
                  {o.isSuspended && <span className="rounded-full bg-[#FFEBEE] border border-[#FFCDD2] px-2 py-0.5 text-xs text-[#C62828]">SUSPENDED</span>}
                </div>
                <div className="text-xs text-[#8A7D6B] truncate">{o.email} {o.username?`• @${o.username}`:""} {o.phone?`• ${o.phone}`:""} • {new Date(o.createdAt).toLocaleDateString("id-ID")}</div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#FDFBF7] border border-[#EDE6D6] px-2.5 py-1">Kos {o.kosCount} • Aktif {o.kosAktif} • Pending {o.kosPending}</span>
                  {o.kosPending>0 && <span className="rounded-full bg-[#FFF3E0] border border-[#FFE0B2] px-2.5 py-1 text-[#8A6D1E]">Perlu approval</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <Button size="sm" variant="outline" onClick={()=>action(o.id,{isVerified:!o.isVerified})} className="rounded-full h-7 text-xs">{o.isVerified?"Unverify":"Verifikasi"}</Button>
                  <Button size="sm" variant={o.isSuspended?"default":"outline"} onClick={()=>action(o.id,{isSuspended:!o.isSuspended})} className={`rounded-full h-7 text-xs ${o.isSuspended?"bg-[#1C1610] text-white hover:bg-[#2C2416]":""}`}>{o.isSuspended?"Aktifkan":"Suspend"}</Button>
                  <Button size="sm" variant="outline" onClick={()=>{setResetId(resetId===o.id?null:o.id); setResetVal("");}} className="rounded-full h-7 text-xs border-[#C9A96A] text-[#8A6D1E] hover:bg-[#FFF7ED]">Reset Pass</Button>
                  <Button size="sm" variant="outline" onClick={()=>doDelete(o.id,o.email)} className="rounded-full h-7 text-xs border-[#FFCDD2] text-[#C62828] hover:bg-[#FFEBEE]">Hapus</Button>
                  <Link href={`/dashboard/admin/listings`} className="inline-flex h-7 items-center rounded-full border border-[#E8DCC8] bg-white px-3 text-xs hover:bg-[#FDFBF7]">Listing →</Link>
                </div>
                {resetId===o.id && (
                  <div className="mt-3 flex gap-2 items-center rounded-xl bg-[#FFF7ED] border border-[#FFE0B2] p-2">
                    <div className="relative flex-1">
                      <Input type={showPass?"text":"password"} value={resetVal} onChange={e=>setResetVal(e.target.value)} placeholder="Password baru min 6" className="h-8 pr-16 text-xs" />
                      <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-white border border-[#E8DCC8] px-2 py-1 text-xs">{showPass?"Sembunyi":"Lihat"}</button>
                    </div>
                    <Button size="sm" onClick={()=>doReset(o.id)} className="rounded-full h-8 bg-[#C9A96A] hover:bg-[#B8944F] text-xs">Simpan</Button>
                    <Button size="sm" variant="outline" onClick={()=>{setResetId(null); setResetVal("");}} className="rounded-full h-8 text-xs">Batal</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {list.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Tidak ada owner untuk filter ini.</p>}
      </div>
    </div>
  );
}
