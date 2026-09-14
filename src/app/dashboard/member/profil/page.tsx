"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ProfilPage() {
  const [form, setForm] = useState({ name:"", username:"", email:"", phone:"", photo:"" });
  const [role, setRole] = useState("-");
  const [msg, setMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [passForm, setPassForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [showPass, setShowPass] = useState({ cur:false, nw:false, cf:false });

  const load = async()=>{
    setLoading(true);
    const r = await fetch("/api/profil");
    const d = await r.json();
    if (r.ok) {
      setForm({ name: d.name||"", username: d.username||"", email: d.email||"", phone: d.phone||"", photo: d.photo||"" });
      setRole(d.role||"-");
    } else setMsg(d.error||"Gagal memuat profil");
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const save = async(e: React.FormEvent)=>{
    e.preventDefault();
    setMsg("Menyimpan...");
    const r = await fetch("/api/profil", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
    const j = await r.json();
    if (!r.ok) setMsg(j.error||"Gagal"); else { setMsg("✅ Profil berhasil diperbarui!"); setForm(f=>({...f, name:j.name||"", username:j.username||"", email:j.email||"", phone:j.phone||"", photo:j.photo||""})); }
  };

  const savePass = async(e: React.FormEvent)=>{
    e.preventDefault();
    setPassMsg("Menyimpan password...");
    const r = await fetch("/api/profil/password", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(passForm) });
    const j = await r.json();
    if (!r.ok) setPassMsg(j.error||"Gagal"); else { setPassMsg("✅ " + j.message); setPassForm({ currentPassword:"", newPassword:"", confirmPassword:"" }); }
  };

  if (loading) return <div className="mx-auto max-w-[560px] px-4 py-10 text-sm text-[#8A7D6B]">Memuat profil...</div>;

  return (
    <div className="mx-auto max-w-[560px] px-4 py-8 space-y-5">
      <div>
        <h1 className="serif text-[28px] leading-none">Profil <span className="text-[#C9A96A]">Saya</span></h1>
        <p className="text-sm text-[#8A7D6B] mt-2">Role: <span className="font-medium text-[#1C1610]">{role}</span> • Atur profil & ganti password.</p>
      </div>

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#C9A96A] via-[#E8DCC8] to-transparent" />
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Image src={form.photo || `https://picsum.photos/seed/aikos-${role}/96/96`} alt="foto" width={96} height={96} className="h-16 w-16 rounded-2xl object-cover border border-[#EDE6D6]" unoptimized />
            <div className="min-w-0">
              <CardTitle className="text-[16px]">{form.name || form.email || "Tamu"}</CardTitle>
              <CardDescription className="text-xs">@{form.username || "-"} • {form.email}</CardDescription>
              <p className="text-xs text-[#B8A99A] mt-1">Foto bisa URL langsung (picsum / upload nanti auto).</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Budi Santoso" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Username</Label>
                <Input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} placeholder="budi_kos (min 3 huruf)" />
              </div>
              <div>
                <Label>No HP</Label>
                <Input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="08xx xxxx xxxx" />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
              <p className="text-xs text-[#B8A99A] mt-1">Ganti email akan cek duplikat dulu.</p>
            </div>
            <div>
              <Label>Foto URL</Label>
              <Input value={form.photo} onChange={e=>setForm({...form, photo:e.target.value})} placeholder="https://... / kosong = random" />
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#1C1610] text-white hover:bg-[#2C2416]">Simpan Perubahan</Button>
            {msg && <p className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] px-3 py-2 text-sm text-[#6B5E4F] text-center">{msg}</p>}
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#1C1610] via-[#C9A96A] to-transparent" />
        <CardHeader className="pb-3">
          <CardTitle className="text-[16px]">Ganti Password</CardTitle>
          <CardDescription className="text-xs">Masukkan password lama, lalu password baru 2x untuk konfirmasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePass} className="space-y-4">
            <div>
              <Label>Password Lama</Label>
              <div className="relative">
                <Input type={showPass.cur ? "text":"password"} value={passForm.currentPassword} onChange={e=>setPassForm({...passForm, currentPassword:e.target.value})} placeholder="••••••••" required className="pr-10" />
                <button type="button" onClick={()=>setShowPass(s=>({...s, cur:!s.cur}))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-[#E8DCC8] bg-white px-2 py-1 text-xs text-[#6B5E4F] hover:bg-[#FDFBF7]">{showPass.cur?"Sembunyi":"Lihat"}</button>
              </div>
            </div>
            <div>
              <Label>Password Baru (min 6 karakter)</Label>
              <div className="relative">
                <Input type={showPass.nw ? "text":"password"} value={passForm.newPassword} onChange={e=>setPassForm({...passForm, newPassword:e.target.value})} placeholder="min 6 karakter" required className="pr-10" />
                <button type="button" onClick={()=>setShowPass(s=>({...s, nw:!s.nw}))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-[#E8DCC8] bg-white px-2 py-1 text-xs text-[#6B5E4F] hover:bg-[#FDFBF7]">{showPass.nw?"Sembunyi":"Lihat"}</button>
              </div>
            </div>
            <div>
              <Label>Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input type={showPass.cf ? "text":"password"} value={passForm.confirmPassword} onChange={e=>setPassForm({...passForm, confirmPassword:e.target.value})} placeholder="ketik ulang password baru" required className="pr-10" />
                <button type="button" onClick={()=>setShowPass(s=>({...s, cf:!s.cf}))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg border border-[#E8DCC8] bg-white px-2 py-1 text-xs text-[#6B5E4F] hover:bg-[#FDFBF7]">{showPass.cf?"Sembunyi":"Lihat"}</button>
              </div>
            </div>
            <Button type="submit" className="w-full rounded-full bg-[#C9A96A] text-white hover:bg-[#B8944F]">Ganti Password</Button>
            {passMsg && <p className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] px-3 py-2 text-sm text-[#6B5E4F] text-center">{passMsg}</p>}
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[#EDE6D6] bg-[#FFF7ED]/60">
        <CardContent className="p-4 text-xs leading-relaxed text-[#6B5E4F]">
          Tips bro: ganti password butuh password lama — kalau lupa, pakai <b>Lupa Password</b> di /login. Username dipakai login selain email. Foto URL bisa picsum dulu.
        </CardContent>
      </Card>
    </div>
  );
}
