"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AddKosStep1() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ nama: "", alamat: "", deskripsi: "" });
  const [kosId, setKosId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const role = (session?.user as any)?.role;

  const next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    if (!session) { setMsg("❌ Harus login dulu bro — silakan login sebagai OWNER"); return; }
    if (role !== "OWNER" && role !== "ADMIN") { setMsg(`❌ Role kamu ${role || "GUEST"} — hanya OWNER yang bisa tambah kos. Login owner@ai-kos.test / owner123`); return; }
    if (form.nama.trim().length < 3) { setMsg("Nama minimal 3 karakter"); return; }
    if (form.alamat.trim().length < 5) { setMsg("Alamat minimal 5 karakter"); return; }
    setLoading(true);
    setMsg("Menyimpan...");
    try {
      const res = await fetch("/api/kos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(`❌ ${data.error || "Gagal simpan kos"} (${res.status})`); setLoading(false); return; }
      setKosId(data.id);
      setMsg(`✅ Kos "${data.nama}" disimpan! Lanjutkan tambah kamar.`);
      setStep(2);
    } catch {
      setMsg("❌ Gagal koneksi — coba lagi");
    } finally { setLoading(false); }
  };

  if (status === "loading") return <div className="mx-auto max-w-md px-4 py-8 text-center text-sm text-[#8A7D6B]">Memuat session...</div>;

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
          <CardHeader><CardTitle className="serif">Login dulu bro</CardTitle><CardDescription>Hanya OWNER yang bisa tambah kos.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#8A7D6B]">Kamu belum login — silakan login sebagai owner.</p>
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-xs space-y-1">
              <div><b>owner@ai-kos.test</b> / owner123</div>
              <div><b>admin@ai-kos.test</b> / admin123</div>
            </div>
            <Link href="/login?callbackUrl=/dashboard/owner/kos/add"><Button className="w-full rounded-full bg-[#1C1610] hover:bg-[#2C2416]">Login →</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (role !== "OWNER" && role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card className="rounded-2xl border-amber-200 bg-amber-50">
          <CardHeader><CardTitle className="text-amber-900">Role tidak cukup</CardTitle><CardDescription>Role kamu: {role}</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-amber-800">Hanya OWNER yang bisa tambah kos. Logout lalu login sebagai owner@ai-kos.test / owner123</p>
            <Link href="/login"><Button className="w-full rounded-full">Ganti akun →</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === 2 && kosId) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
          <CardHeader>
            <CardTitle className="serif">Langkah 2: Tambah Kamar</CardTitle>
            <CardDescription>Kos dasar telah disimpan — sekarang tambahkan kamar pertama.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-[#2E7D32]">{msg}</p>
            <Button onClick={()=>router.push(`/dashboard/owner/kos/${kosId}/kamar/add`)} className="w-full rounded-full bg-[#1C1610] hover:bg-[#2C2416]">
              Lanjut ke Tambah Kamar →
            </Button>
            <Button variant="outline" onClick={()=>router.push(`/dashboard/owner/kos/${kosId}`)} className="w-full rounded-full">
              Lihat Kos
            </Button>
            <Button variant="outline" onClick={()=>router.push("/dashboard/owner/kos")} className="w-full rounded-full">
              Kembali ke Daftar Kos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card className="rounded-2xl border-[#EDE6D6] shadow-soft">
        <CardHeader>
          <CardTitle className="serif">Tambah Kos Baru</CardTitle>
          <CardDescription>Isi data kos — setelah simpan kamu akan diarahkan ke tambah kamar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={next} className="space-y-4">
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
            <Button type="submit" disabled={loading} className="w-full rounded-full bg-[#C9A96A] hover:bg-[#B8944F] text-white">
              {loading ? "Menyimpan..." : "Simpan & Lanjutkan →"}
            </Button>
            {msg && <p className="mt-2 text-sm rounded-xl border border-[#EDE6D6] bg-[#FDFBF7] px-3 py-2">{msg}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
