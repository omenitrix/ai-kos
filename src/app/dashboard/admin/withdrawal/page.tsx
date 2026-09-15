"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminWithdrawal() {
  const [list, setList] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const fetchList = () => fetch("/api/admin/withdrawal").then(r=>r.json()).then(j=>{ if(j.error) setErr(j.error); else setList(j); }).catch(e=>setErr(String(e)));
  useEffect(()=>{ fetchList(); },[]);
  async function act(id: string, status: "APPROVED"|"REJECTED") {
    setMsg(""); setErr("");
    const res = await fetch("/api/admin/withdrawal", { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ id, status }) });
    const j = await res.json();
    if (!res.ok) setErr(j.error || "Gagal");
    else { setMsg(`${status} ✓`); fetchList(); }
  }
  if (err && !list.length) return <div className="p-6"><Link href="/dashboard/admin" className="text-sm text-[#8A7D6B] hover:underline">← Dashboard Admin</Link><p className="mt-4 text-sm text-red-600">{err}</p></div>;
  return (
    <div className="p-4 md:p-6 max-w-[1100px] space-y-4">
      <div className="flex items-center justify-between">
        <div><Link href="/dashboard/admin" className="text-xs tracking-widest uppercase text-[#B8A99A] hover:text-[#8A7D6B]">← Dashboard Admin</Link><h1 className="serif text-[26px] mt-1">Penarikan <span className="text-[#C9A96A]">Owner</span></h1><p className="text-sm text-[#8A7D6B]">Approve / reject ajuan withdrawal — saldo real dari payments SUCCESS.</p></div>
        <span className="rounded-full bg-[#1C1610] text-white px-4 py-2 text-xs">Total {list.length}</span>
      </div>
      {msg && <p className="text-sm text-[#2E7D32] bg-[#EAF6EC] border border-[#C8E6C9] rounded-xl px-3 py-2">{msg}</p>}
      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{err}</p>}
      <div className="grid gap-3">
        {list.length===0 ? <Card className="border-[#EDE6D6]"><CardContent className="py-8 text-center text-sm text-[#8A7D6B]">Belum ada pengajuan penarikan.</CardContent></Card> : list.map((r:any)=>(
          <Card key={r.id} className="border-[#EDE6D6]">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Rp {Number(r.meta?.amount||0).toLocaleString("id-ID")} <span className={`ml-2 text-xs rounded-full px-2 py-0.5 border ${r.meta?.status==="APPROVED"?"bg-[#EAF6EC] border-[#C8E6C9] text-[#2E7D32]":r.meta?.status==="REJECTED"?"bg-red-50 border-red-200 text-red-700":"bg-[#FFF3E0] border-[#FFE0B2] text-[#8A6D1E]"}`}>{r.meta?.status||r.action}</span></CardTitle>
              <p className="text-xs text-[#8A7D6B]">{r.owner?.name||r.meta?.email} • {r.meta?.bank} {r.meta?.rekening} • {new Date(r.createdAt).toLocaleString("id-ID")}</p>
            </CardHeader>
            <CardContent>
              {r.meta?.status==="PENDING" && (
                <div className="flex gap-2">
                  <Button onClick={()=>act(r.id,"APPROVED")} className="bg-[#1C1610] hover:bg-[#2C2416]">Approve & Transfer</Button>
                  <Button onClick={()=>act(r.id,"REJECTED")} variant="outline" className="border-[#EDE6D6]">Reject</Button>
                </div>
              )}
              {r.meta?.note && <p className="text-xs text-[#6B5E4F] mt-2">{r.meta.note}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
