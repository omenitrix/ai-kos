"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminVerifikasi() {
  const [list, setList] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const fetchList = () => fetch("/api/admin/verifikasi").then(r=>r.json()).then(j=>{ if(j.error) setErr(j.error); else setList(j); }).catch(e=>setErr(String(e)));
  useEffect(()=>{ fetchList(); },[]);
  async function act(id: string, status: "APPROVED"|"REJECTED") {
    setMsg(""); setErr("");
    const res = await fetch("/api/admin/verifikasi", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, status, nota: status==="REJECTED" ? "Dokumen tidak jelas" : "" }) });
    const j = await res.json();
    if (!res.ok) setErr(j.error || "Gagal");
    else { setMsg(`${status} ✓`); fetchList(); }
  }
  if (err && !list.length) return <div className="p-6"><Link href="/dashboard/admin" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard Admin</Link><p className="mt-4 text-sm text-red-600">{err}</p></div>;
  return (
    <div className="p-4 md:p-6 max-w-[1100px] space-y-4">
      <div className="flex items-center justify-between">
        <div><Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link><h1 className="serif text-[26px] mt-1">Verifikasi <span className="text-[#C9A96A]">KTP & Selfie</span></h1><p className="text-sm text-[#8A7D6B]">Review pengajuan owner — file di bucket <code>verifikasi</code> (private).</p></div>
        <span className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs">Total {list.length}</span>
      </div>
      {msg && <p className="text-sm text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-xl px-3 py-2">{msg}</p>}
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <div className="grid gap-3">
        {list.length===0 ? <Card className="border-[#EDE6D6]"><CardContent className="py-8 text-center text-sm text-[#8A7D6B]">Belum ada pengajuan verifikasi.</CardContent></Card> : list.map((v:any)=>(
          <Card key={v.id} className="border-[#EDE6D6]">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{v.type} <span className={`text-xs rounded-full px-2 py-0.5 border ${v.status==="APPROVED"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":v.status==="REJECTED"?"bg-red-50 border-red-200 text-red-700":"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]"}`}>{v.status}</span></CardTitle>
              <p className="text-xs text-[#8A7D6B]">{v.user?.name||v.user?.email} • {v.user?.email} • {new Date(v.createdAt).toLocaleString("id-ID")}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {v.fileUrl && <a href={v.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-white border border-[#EDE6D6] px-3 py-1 text-xs hover:bg-[#FDFBF7]">Lihat File ↗</a>}
              {v.nota && <p className="text-xs text-[#6B5E4F] bg-[#FDFBF7] border border-[#EDE6D6] rounded-xl px-3 py-2">{v.nota}</p>}
              {v.status==="PENDING" && (
                <div className="flex gap-2 pt-1">
                  <Button onClick={()=>act(v.id,"APPROVED")} className="bg-[#1C1610] hover:bg-[#2C2416]">Approve</Button>
                  <Button onClick={()=>act(v.id,"REJECTED")} variant="outline" className="border-[#EDE6D6]">Reject</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
