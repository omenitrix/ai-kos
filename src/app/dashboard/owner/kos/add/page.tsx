"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddKosStep1() {
  const [form, setForm] = useState({ nama: "", alamat: "", deskripsi: "" });
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");

  const next = async () => {
    setMsg("Menyimpan...");
    // In real app, we would POST to /api/kos and get kosId, then go to step 2 (kamar)
    // For now, we mock
    setMsg("Kos disimpan! Lanjutkan ke langkah menambahkan kamar.");
    setStep(2);
  };

  if (step === 2) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card>
          <CardHeader><CardTitle>Langkah 2: Tambah Kamar</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-4">Kos dasar telah disimpan. Sekarang tambahkan detail kamar.</p>
            <Button onClick={()=>{/* navigate to kamar add */}} className="w-full">
              Lanjut ke Tambah Kamar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Tambah Kos Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e)=>{ e.preventDefault(); next(); }} className="space-y-4">
            <div>
              <Label>Nama Kos</Label>
              <Input value={form.nama} onChange={(e)=>setForm({...form, nama:e.target.value})} required placeholder="Contoh: Kos Aman Sentosa" />
            </div>
            <div>
              <Label>Alamat Lengkap</Label>
              <Input value={form.alamat} onChange={(e)=>setForm({...form, alamat:e.target.value})} required placeholder="Jl. Contoh No.10, Kota" />
            </div>
            <div>
              <Label>Deskripsi (opsional)</Label>
              <Textarea value={form.deskripsi} onChange={(e)=>setForm({...form, deskripsi:e.target.value})} placeholder="Fasilitas, lingkungan, dsb." />
            </div>
            <Button type="submit" className="w-full">Simpan & Lanjutkan</Button>
            {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
