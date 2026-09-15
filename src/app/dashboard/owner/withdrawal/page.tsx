"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Withdrawal() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [rek, setRek] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = () => fetch("/api/withdrawal").then(r=>r.json()).then(j=>{ if(j.error) setErr(j.error); else setData(j); }).catch(e=>setErr(String(e)));
  useEffect(()=>{ fetchData(); },[]);

  async function submit() {
    setErr(""); setMsg(""); setLoading(true);
    const res = await fetch("/api/withdrawal", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ amount: Number(amount), bank, rekening: rek }) });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) setErr(j.error || "Gagal");
    else { setMsg("Pengajuan terkirim — menunggu approve admin ✓"); setAmount(""); fetchData(); }
  }

  if (err && !data) return <div className="p-6"><Link href="/dashboard/owner" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard Owner</Link><p className="mt-4 text-sm text-red-600">{err}</p></div>;
  if (!data) return <div className="p-6 text-sm text-[#8A7D6B]">Memuat saldo...</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/dashboard/owner" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard Owner</Link>
      <Card className="mt-4 border-[#EDE6D6]">
        <CardHeader><CardTitle className="serif">Penarikan Pendapatan</CardTitle>
          <p className="text-sm text-[#8A7D6B]">Saldo = total payments SUCCESS kos kamu minus penarikan APPROVED. Ajuan disimpan di <code>admin_logs</code> targetType WITHDRAWAL.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3 text-center"><div className="text-xs text-[#8A7D6B]">Saldo</div><div className="font-bold text-[#1C1610]">Rp {Number(data.saldo).toLocaleString("id-ID")}</div></div>
            <div className="rounded-xl bg-white border border-[#EDE6D6] p-3 text-center"><div className="text-xs text-[#8A7D6B]">Total Masuk</div><div className="font-semibold">Rp {Number(data.totalMasuk).toLocaleString("id-ID")}</div></div>
            <div className="rounded-xl bg-white border border-[#EDE6D6] p-3 text-center"><div className="text-xs text-[#8A7D6B]">Keluar (Approved)</div><div className="font-semibold">Rp {Number(data.totalKeluar).toLocaleString("id-ID")}</div></div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#1C1610] to-[#2C2416] border border-[#3A2E1E] p-4 text-white">
            <p className="text-sm font-medium">Ajukan Penarikan</p>
            <div className="mt-3 grid gap-2">
              <Label className="text-[#E8DCC8]">Nominal (min 50.000)</Label>
              <Input type="number" placeholder="1000000" value={amount} onChange={e=>setAmount(e.target.value)} className="bg-white text-black" />
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-[#E8DCC8]">Bank</Label><Input placeholder="BCA" value={bank} onChange={e=>setBank(e.target.value)} className="bg-white text-black mt-1" /></div>
                <div><Label className="text-[#E8DCC8]">No Rekening</Label><Input placeholder="1234567890" value={rek} onChange={e=>setRek(e.target.value)} className="bg-white text-black mt-1" /></div>
              </div>
              <Button onClick={submit} disabled={loading || !amount} className="w-full bg-[#C9A96A] hover:bg-[#B8944F] text-white mt-1">{loading?"Mengirim...":"Ajukan Penarikan"}</Button>
              {msg && <p className="text-xs text-[#A5D6A7] bg-white/10 border border-white/20 rounded-xl px-3 py-2">{msg}</p>}
              {err && <p className="text-xs text-red-200 bg-red-900/30 border border-red-800 rounded-xl px-3 py-2">{err}</p>}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#8A7D6B]">Riwayat Penarikan</p>
            <div className="mt-2 space-y-2 max-h-[320px] overflow-auto pr-1">
              {(data.riwayat||[]).length===0 ? <p className="text-sm text-[#8A7D6B]">Belum ada pengajuan.</p> : (data.riwayat||[]).map((r:any)=>(
                <div key={r.id} className="flex items-center justify-between rounded-xl border border-[#EDE6D6] bg-white px-3 py-2">
                  <div><div className="text-sm font-medium">Rp {Number(r.meta?.amount||0).toLocaleString("id-ID")} • {r.meta?.bank||"-"} {r.meta?.rekening||""}</div><div className="text-xs text-[#8A7D6B]">{new Date(r.createdAt).toLocaleString("id-ID")}</div></div>
                  <span className={`text-xs rounded-full px-2 py-1 border ${r.meta?.status==="APPROVED"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":r.meta?.status==="REJECTED"?"bg-red-50 border-red-200 text-red-700":"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]"}`}>{r.meta?.status||r.action}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
