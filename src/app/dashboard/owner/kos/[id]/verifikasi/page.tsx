"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function OwnerVerifikasi({ params }: { params: { id: string } }) {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [ktpUrl, setKtpUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [list, setList] = useState<any[]>([]);

  const fetchList = () => fetch("/api/verifikasi").then(r=>r.json()).then(j=>{ if(Array.isArray(j)) setList(j); }).catch(()=>{});

  useEffect(()=>{ fetchList(); },[]);

  async function uploadFile(file: File, type: "KTP"|"SELFIE") {
    setErr(""); setMsg(`Uploading ${type}...`);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "verifikasi");
    const res = await fetch("/api/uploadthing", { method:"POST", body: fd });
    const j = await res.json();
    if (!res.ok) { setErr(j.error || "Upload gagal"); setMsg(""); return; }
    if (type==="KTP") setKtpUrl(j.url);
    else setSelfieUrl(j.url);
    setMsg(`${type} terupload ✓`);
  }

  async function submit(type: "KTP"|"SELFIE") {
    const url = type==="KTP" ? ktpUrl : selfieUrl;
    if (!url) { setErr(`Upload ${type} dulu`); return; }
    setLoading(true); setErr(""); setMsg("");
    const res = await fetch("/api/verifikasi", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ type, fileUrl: url, nota: `Kos ${params.id}` }) });
    const j = await res.json();
    setLoading(false);
    if (!res.ok) setErr(j.error || "Gagal kirim");
    else { setMsg(`${type} terkirim — status PENDING, admin akan review ✓`); fetchList(); if(type==="KTP") setKtpUrl(""); else setSelfieUrl(""); }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link href={`/dashboard/owner/kos/${params.id}`} className="text-sm text-[#8A7D6B] hover:underline">← Kembali</Link>
      <Card className="mt-4 border-[#EDE6D6]">
        <CardHeader><CardTitle className="serif">Verifikasi KTP & Wajah — Kos {params.id}</CardTitle>
          <p className="text-sm text-[#8A7D6B]">Upload ke bucket <b>verifikasi</b> (private). Admin approve di <code>/dashboard/admin/verifikasi</code>. Data tersimpan di tabel <code>verifications</code>.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3">
            <Label>Foto KTP</Label>
            <Input type="file" accept="image/*" className="mt-1" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) uploadFile(f,"KTP"); }} />
            {ktpUrl && <p className="text-xs text-[#2E7D32] mt-1 truncate">✓ {ktpUrl}</p>}
            <Button onClick={()=>submit("KTP")} disabled={loading || !ktpUrl} className="w-full mt-2 bg-[#1C1610] hover:bg-[#2C2416]">{loading?"Mengirim...":"Kirim KTP"}</Button>
          </div>
          <div className="rounded-xl bg-[#FDFBF7] border border-[#EDE6D6] p-3">
            <Label>Selfie + KTP</Label>
            <Input type="file" accept="image/*" className="mt-1" onChange={(e)=>{ const f=e.target.files?.[0]; if(f) uploadFile(f,"SELFIE"); }} />
            {selfieUrl && <p className="text-xs text-[#2E7D32] mt-1 truncate">✓ {selfieUrl}</p>}
            <Button onClick={()=>submit("SELFIE")} disabled={loading || !selfieUrl} className="w-full mt-2 bg-[#C9A96A] hover:bg-[#B8944F]">{loading?"Mengirim...":"Kirim Selfie"}</Button>
          </div>
          {msg && <p className="text-sm text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-xl px-3 py-2">{msg}</p>}
          {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}

          {list.length>0 && (
            <div className="border-t border-[#EDE6D6] pt-3">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#8A7D6B]">Riwayat Verifikasi Kamu</p>
              <div className="mt-2 space-y-2">
                {list.map((v:any)=>(
                  <div key={v.id} className="flex items-center justify-between rounded-xl border border-[#EDE6D6] bg-white px-3 py-2">
                    <span className="text-sm font-medium">{v.type}</span>
                    <span className={`text-xs rounded-full px-2 py-1 border ${v.status==="APPROVED"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":v.status==="REJECTED"?"bg-red-50 border-red-200 text-red-700":"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]"}`}>{v.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
