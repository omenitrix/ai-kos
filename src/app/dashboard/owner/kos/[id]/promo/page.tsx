"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
export default function OwnerPromo({ params }: { params: { id: string } }) {
  const [form, setForm] = useState({ kode:"", diskonPersen:"", mulai:"", akhir:"" });
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Menyimpan promo...");
    const res = await fetch("/api/promo",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ kosId: params.id, kode: form.kode, diskonPersen: Number(form.diskonPersen)||undefined, masaBerlakuAwal: form.mulai, masaBerlakuAkhir: form.akhir })});
    const d = await res.json();
    setMsg(res.ok ? "Promo tersimpan: " + d.kode : "Gagal: " + (d.error||res.statusText));
  }
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href={`/dashboard/owner/kos/${params.id}`} className="text-sm text-muted-foreground hover:underline">&larr; Kembali</Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>Kelola Promo — Kos {params.id}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div><Label>Kode Promo</Label><Input value={form.kode} onChange={e=>setForm({...form,kode:e.target.value})} placeholder="FLASH50" required /></div>
            <div><Label>Diskon %</Label><Input type="number" value={form.diskonPersen} onChange={e=>setForm({...form,diskonPersen:e.target.value})} placeholder="20" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mulai</Label><Input type="date" value={form.mulai} onChange={e=>setForm({...form,mulai:e.target.value})} required /></div>
              <div><Label>Berakhir</Label><Input type="date" value={form.akhir} onChange={e=>setForm({...form,akhir:e.target.value})} required /></div>
            </div>
            <Button type="submit" className="w-full">Simpan Promo</Button>
            {msg && <p className="text-sm text-muted-foreground break-all">{msg}</p>}
          </form>
          <p className="mt-4 text-xs text-muted-foreground">Flash sale & featured listing dipicu via isFlashSale/isFeatured di payload (admin dapat set featured).</p>
        </CardContent>
      </Card>
    </div>
  );
}
