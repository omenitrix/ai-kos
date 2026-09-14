"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function RegisterPage() {
  const [form, setForm] = useState({ username:"", email:"", password:"", phone:"", role:"GUEST" });
  const [msg, setMsg] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Mendaftarkan...");
    const res = await fetch("/api/auth/register", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setMsg(res.ok ? "Berhasil! Cek email untuk OTP verifikasi (mock: " + (data.otp || "-") + ")" : "Gagal: " + (data.error || res.statusText));
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <CardHeader><CardTitle>Daftar Akun</CardTitle><CardDescription>Guest / Member / Owner Kos</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <div><Label>Username</Label><Input value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} required /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required /></div>
            <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required /></div>
            <div><Label>No HP</Label><Input value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} placeholder="08xx" /></div>
            <div><Label>Role</Label><select className="w-full rounded-md border h-10 px-3" value={form.role} onChange={(e)=>setForm({...form, role:e.target.value})}><option value="GUEST">Guest</option><option value="MEMBER">Member (Penyewa)</option><option value="OWNER">Owner Kos</option></select></div>
            <Button type="submit" className="w-full">Daftar & Kirim OTP</Button>
            {msg && <p className="text-sm text-muted-foreground break-all">{msg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
