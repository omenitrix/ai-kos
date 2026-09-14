"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AddKamar() {
  const [form, setForm] = useState({ nomor: "", tipe: "", luasM2: "", furnished: false, ac: false, wifi: false, hargaBulanan: "" });
  const [msg, setMsg] = useState("");

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("Menyimpan kamar...");
    // mock: POST to /api/kos/[id]/kamar
    setMsg("Kamar disimpan! Anda dapat menambahkan kamar lain atau kembali.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Tambah Kamar Baru</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nomor Kamar</Label>
                <Input value={form.nomor} onChange={(e)=>setForm({...form, nomor:e.target.value})} placeholder="A-01" required />
              </div>
              <div>
                <Label>Tipe Kamar</Label>
                <Input value={form.tipe} onChange={(e)=>setForm({...form, tipe:e.target.value})} placeholder="Kost Putri / Kost Campur" required />
              </div>
            </div>
            <div>
              <Label>Luas (m²)</Label>
              <Input type="number" value={form.luasM2} onChange={(e)=>setForm({...form, luasM2:e.target.value})} placeholder="12" required />
            </div>
            <div className="flex flex-wrap gap-4 items-start">
              <div>
                <Label className="flex items-center">
                  <input type="checkbox" checked={form.furnished} onChange={(e)=>setForm({...form, furnished:e.target.checked})} /> Furnitur
                </Label>
              </div>
              <div>
                <Label className="flex items-center">
                  <input type="checkbox" checked={form.ac} onChange={(e)=>setForm({...form, ac:e.target.checked})} /> AC
                </Label>
              </div>
              <div>
                <Label className="flex items-center">
                  <input type="checkbox" checked={form.wifi} onChange={(e)=>setForm({...form, wifi:e.target.checked})} /> WiFi
                </Label>
              </div>
            </div>
            <div>
              <Label>Harga Bulanan (Rp)</Label>
              <Input type="number" value={form.hargaBulanan} onChange={(e)=>setForm({...form, hargaBulanan:e.target.value})} placeholder="1500000" required />
            </div>
            <Button type="submit" className="w-full">Simpan Kamar</Button>
            {msg && <p className="mt-2 text-sm text-muted-foreground">{msg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
