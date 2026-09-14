"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
export default function OwnerVerifikasi({ params }: { params: { id: string } }) {
  const [msg,setMsg]=useState("");
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href={`/dashboard/owner/kos/${params.id}`} className="text-sm text-muted-foreground hover:underline">&larr; Kembali</Link>
      <Card className="mt-4">
        <CardHeader><CardTitle>Verifikasi KTP & Wajah — Kos {params.id}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Upload KTP & selfie. Integrasi provider pihak ketiga di-mock bila key belum ada (lihat lib/upload.ts). Data sensitif dienkripsi at-rest (kolom terpisah, hash/KMS di production).</p>
          <div><Label>Foto KTP</Label><Input type="file" accept="image/*" onChange={()=>setMsg("File KTP terpilih (mock upload).")} /></div>
          <div><Label>Selfie + KTP</Label><Input type="file" accept="image/*" onChange={()=>setMsg("Selfie terpilih (mock).")} /></div>
          <Button onClick={()=>setMsg("Verifikasi dikirim — status PENDING, admin akan review.")} className="w-full">Kirim Verifikasi</Button>
          {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
