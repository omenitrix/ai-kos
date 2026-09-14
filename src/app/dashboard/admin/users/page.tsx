"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ROLE_COLOR: Record<string,string> = { ADMIN:"bg-[#1C1610] text-white border-[#3A2E1E]", OWNER:"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]", MEMBER:"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]", GUEST:"bg-white border-[#EDE6D6] text-[#6B5E4F]" };

export default function AdminUsers() {
  const [users,setUsers]=useState<any[]>([]);
  const [q,setQ]=useState("");
  const [role,setRole]=useState("");
  const [status,setStatus]=useState("");
  const [msg,setMsg]=useState("");
  const [resetId,setResetId]=useState<string|null>(null);
  const [resetVal,setResetVal]=useState("");
  const [showPass,setShowPass]=useState(false);

  const load = useCallback(async()=>{
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (role) p.set("role", role);
    if (status) p.set("status", status);
    const r=await fetch("/api/admin/users?"+p.toString());
    const d=await r.json();
    setUsers(Array.isArray(d)?d:[]);
  },[q,role,status]);
  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{ const t=setTimeout(load,300); return ()=>clearTimeout(t); },[load]);

  const action = async(userId:string, data:any)=>{
    const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId, ...data})});
    const j=await r.json();
    if(!r.ok) setMsg(j.error||"Gagal"); else { setMsg(`✅ ${j.email} updated`); load(); }
  };

  const doReset = async(userId:string)=>{
    if (!resetVal || resetVal.length < 6) { setMsg("Password baru minimal 6 karakter bro"); return; }
    const r=await fetch(`/api/admin/users/${userId}/reset-password`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({newPassword: resetVal})});
    const j=await r.json();
    if(!r.ok) setMsg(j.error||"Gagal reset"); else { setMsg(`✅ ${j.message}`); setResetId(null); setResetVal(""); }
  };

  const doDelete = async(userId:string, email:string)=>{
    if (!confirm(`Hapus user ${email} ?\nUser dengan kos/booking/pesanan tidak bisa dihapus — harus kosongkan dulu.`)) return;
    const r=await fetch(`/api/admin/users/${userId}`,{method:"DELETE"});
    const j=await r.json();
    if(!r.ok) setMsg(j.error||"Gagal hapus"); else { setMsg(`✅ User ${email} dihapus`); load(); }
  };

  const stats = {
    total: users.length,
    admin: users.filter(u=>u.role==="ADMIN").length,
    owner: users.filter(u=>u.role==="OWNER").length,
    member: users.filter(u=>u.role==="MEMBER").length,
    suspended: users.filter(u=>u.isSuspended).length,
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-[1100px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link>
          <h1 className="serif text-[26px] leading-none mt-1">Kelola <span className="text-[#C9A96A]">User</span></h1>
          <p className="text-sm text-[#8A7D6B] mt-1">{stats.total} user • {stats.admin} admin • {stats.owner} owner • {stats.member} member • {stats.suspended} suspended</p>
        </div>
        <Link href="/dashboard/admin/owners" className="rounded-full border border-[#E8DCC8] bg-white px-4 py-2 text-xs font-medium hover:bg-[#FDFBF7]">Kelola Owner →</Link>
      </div>

      {msg && <div className="rounded-2xl bg-[#FDFBF7] border border-[#EDE6D6] px-4 py-3 text-sm">{msg}</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-[#EDE6D6] p-4"><div className="text-xs tracking-widest uppercase text-[#B8A99A]">Total</div><div className="serif text-xl">{stats.total}</div></div>
        <div className="rounded-2xl bg-[#FFF7ED] border border-[#FFE0B2] p-4"><div className="text-xs tracking-widest uppercase text-[#8A6D1E]">Owner</div><div className="serif text-xl">{stats.owner}</div></div>
        <div className="rounded-2xl bg-[#EAF6EC] border border-[#C8E6C9] p-4"><div className="text-xs tracking-widest uppercase text-[#2E7D32]">Member</div><div className="serif text-xl">{stats.member}</div></div>
        <div className="rounded-2xl bg-[#FFEBEE] border border-[#FFCDD2] p-4"><div className="text-xs tracking-widest uppercase text-[#C62828]">Suspended</div><div className="serif text-xl">{stats.suspended}</div></div>
      </div>

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardContent className="p-4 flex flex-wrap gap-2 items-center">
          <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nama / email / username / phone..." className="max-w-[260px]" />
          <select value={role} onChange={e=>setRole(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">OWNER</option>
            <option value="MEMBER">MEMBER</option>
            <option value="GUEST">GUEST</option>
          </select>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="rounded-xl border border-[#E8DCC8] bg-white h-10 px-3 text-sm">
            <option value="">Semua status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="active">Aktif</option>
            <option value="suspended">Suspended</option>
          </select>
          <span className="text-xs text-[#8A7D6B] ml-auto">{users.length} hasil</span>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {users.map(u=>(
          <Card key={u.id} className="rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
            <CardContent className="p-4 flex gap-3 items-start">
              <Image src={u.photo || `https://picsum.photos/seed/user-${u.id}/80/80`} alt={u.email || "user"} width={80} height={80} className="h-11 w-11 rounded-xl object-cover border border-[#EDE6D6] shrink-0" unoptimized />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm truncate">{u.name || u.email}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[u.role]||"bg-white border-[#EDE6D6]"}`}>{u.role}</span>
                  {u.isVerified ? <span className="rounded-full bg-[#EAF6EC] border border-[#C8E6C9] px-2 py-0.5 text-xs text-[#2E7D32]">✓ Verified</span> : <span className="rounded-full bg-white border-[#EDE6D6] px-2 py-0.5 text-xs text-[#8A7D6B]">Unverified</span>}
                  {u.isSuspended && <span className="rounded-full bg-[#FFEBEE] border border-[#FFCDD2] px-2 py-0.5 text-xs text-[#C62828]">SUSPENDED</span>}
                </div>
                <div className="text-xs text-[#8A7D6B] truncate">{u.email} {u.username?`• @${u.username}`:""} {u.phone?`• ${u.phone}`:""} • {new Date(u.createdAt).toLocaleDateString("id-ID")}</div>
                <div className="text-xs text-[#B8A99A]">Kos {u.kosCount||0} • Booking {u.bookingCount||0}</div>
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <select value={u.role} onChange={e=>action(u.id,{role:e.target.value})} className="rounded-full border border-[#E8DCC8] bg-white h-7 px-2 text-xs">
                    <option value="GUEST">GUEST</option><option value="MEMBER">MEMBER</option><option value="OWNER">OWNER</option><option value="ADMIN">ADMIN</option>
                  </select>
                  <Button size="sm" variant="outline" onClick={()=>action(u.id,{isVerified:!u.isVerified})} className="rounded-full h-7 text-xs">{u.isVerified?"Unverify":"Verifikasi"}</Button>
                  <Button size="sm" variant={u.isSuspended?"default":"outline"} onClick={()=>action(u.id,{isSuspended:!u.isSuspended})} className={`rounded-full h-7 text-xs ${u.isSuspended?"bg-[#1C1610] text-white hover:bg-[#2C2416]":""}`}>{u.isSuspended?"Aktifkan":"Suspend"}</Button>
                  <Button size="sm" variant="outline" onClick={()=>{ setResetId(resetId===u.id?null:u.id); setResetVal(""); }} className="rounded-full h-7 text-xs border-[#C9A96A] text-[#8A6D1E] hover:bg-[#FFF7ED]">Reset Pass</Button>
                  <Button size="sm" variant="outline" onClick={()=>doDelete(u.id, u.email)} className="rounded-full h-7 text-xs border-[#FFCDD2] text-[#C62828] hover:bg-[#FFEBEE]">Hapus</Button>
                </div>
                {resetId===u.id && (
                  <div className="mt-3 flex gap-2 items-center rounded-xl bg-[#FFF7ED] border border-[#FFE0B2] p-2">
                    <div className="relative flex-1">
                      <Input type={showPass?"text":"password"} value={resetVal} onChange={e=>setResetVal(e.target.value)} placeholder="Password baru min 6" className="h-8 pr-16 text-xs" />
                      <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-white border border-[#E8DCC8] px-2 py-1 text-xs">{showPass?"Sembunyi":"Lihat"}</button>
                    </div>
                    <Button size="sm" onClick={()=>doReset(u.id)} className="rounded-full h-8 bg-[#C9A96A] hover:bg-[#B8944F] text-xs">Simpan</Button>
                    <Button size="sm" variant="outline" onClick={()=>{setResetId(null); setResetVal("");}} className="rounded-full h-8 text-xs">Batal</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length===0 && <p className="text-center text-sm text-[#8A7D6B] py-10">Tidak ada user untuk filter ini.</p>}
      </div>
    </div>
  );
}
