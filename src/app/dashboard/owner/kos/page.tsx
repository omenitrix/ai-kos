"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Kos = { id: string; nama: string; slug: string; alamat: string; fotoSampul: string | null; status: string; kamar: { id: string; hargaBulanan: number }[]; createdAt: string };

export default function OwnerKosList() {
  const [list, setList] = useState<Kos[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    setLoading(true); setErr("");
    try {
      const r = await fetch("/api/owner/kos");
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "Gagal load"); setList([]); }
      else setList(Array.isArray(d) ? d : []);
    } catch (e: any) { setErr(String(e)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-[#8A7D6B]">Memuat kos saya...</div>;
  if (err) return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Card className="rounded-2xl border-amber-200 bg-amber-50"><CardContent className="p-6 text-sm text-amber-800">{err} — <button onClick={load} className="underline">coba lagi</button> <Link href="/login" className="underline ml-2">Login</Link></CardContent></Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="serif text-[22px]">Daftar Kos Saya</h2>
          <p className="text-xs text-[#8A7D6B]">{list.length} kos • yang kamu tambah via /dashboard/owner/kos/add akan muncul di sini</p>
        </div>
        <Link href="/dashboard/owner/kos/add">
          <Button className="rounded-full bg-[#1C1610] hover:bg-[#2C2416]">+ Tambah Kos Baru</Button>
        </Link>
      </div>
      {list.length === 0 ? (
        <Card className="rounded-2xl border-[#EDE6D6] bg-[#FDFBF7]"><CardContent className="p-10 text-center text-sm text-[#8A7D6B]">Belum ada kos — klik <b>+ Tambah Kos Baru</b> untuk buat kos pertama bro.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {list.map((k) => (
            <Card key={k.id} className="border rounded-2xl overflow-hidden border-[#EDE6D6] shadow-soft">
              <CardHeader className="flex flex-row items-center p-4 gap-4">
                <Image src={k.fotoSampul || `https://picsum.photos/seed/${k.id}/200/150`} alt={k.nama || "kos"} width={200} height={150} className="w-16 h-16 object-cover rounded-xl border border-[#EDE6D6]" unoptimized />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base serif truncate">{k.nama}</CardTitle>
                  <p className="text-sm text-muted-foreground truncate">{k.alamat}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs border ${k.status === "AKTIF" ? "bg-[#EAF6EC] text-[#2E7D32] border-[#C8E6C9]" : k.status === "PENDING_APPROVAL" ? "bg-[#FFF3E0] text-[#8A6D1E] border-[#FFE0B2]" : "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]"}`}>
                      {k.status}
                    </span>
                    <span className="text-xs text-[#8A7D6B]">{k.kamar.length} kamar {k.kamar[0] ? `• Rp ${k.kamar[0].hargaBulanan.toLocaleString("id-ID")}/bln` : ""}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-wrap gap-2 items-center">
                <Link href={`/dashboard/owner/kos/${k.id}`} className="text-sm text-[#C9A96A] hover:underline">
                  Lihat Detail & Kelola Kamar →
                </Link>
                <div className="ml-auto flex gap-2">
                  <Link href={`/dashboard/owner/kos/${k.id}/kamar/add`}>
                    <Button size="sm" variant="outline" className="rounded-full">+ Kamar</Button>
                  </Link>
                  <Link href={`/kos/${k.slug}`} target="_blank">
                    <Button size="sm" variant="outline" className="rounded-full">Lihat Publik</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
