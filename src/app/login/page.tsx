"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Memproses...");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setMsg("Login gagal: " + res.error);
    else { setMsg("Berhasil! Mengalihkan..."); router.push("/dashboard"); }
  }
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card>
        <CardHeader><CardTitle>Masuk AI-KOS</CardTitle><CardDescription>Login dengan email & password atau Google</CardDescription></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div><Label>Email</Label><Input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email@contoh.id" required /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
            <Button type="submit" className="w-full">Masuk</Button>
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
          </form>
          <div className="mt-4 text-sm text-center space-y-2">
            <button onClick={()=>signIn("google")} className="w-full rounded-md border py-2 hover:bg-muted">Masuk dengan Google</button>
            <div><Link href="/register" className="text-primary hover:underline">Belum punya akun? Daftar</Link> • <Link href="#" className="hover:underline">Lupa password?</Link></div>
            <p className="text-xs text-muted-foreground">AI Security: login mencurigakan akan ditandai (heuristik IP/device — mock saat ini).</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
