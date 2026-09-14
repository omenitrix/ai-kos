"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
export default function AdminLogs() {
  const [list,setList]=useState<any[]>([]);
  useEffect(()=>{ fetch("/api/admin/logs").then(r=>r.json()).then(d=>Array.isArray(d)?setList(d):setList([])).catch(()=>setList([])); },[]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/dashboard/admin" className="text-sm text-muted-foreground hover:underline">&larr; Dashboard Admin</Link>
      <h1 className="mt-2 text-xl font-bold">Admin Logs</h1>
      <div className="mt-4 space-y-2">
        {list.length===0 ? <p className="text-sm text-muted-foreground">Belum ada log.</p> : list.map((l:any)=>(<Card key={l.id}><CardContent className="p-3 text-sm"><b>{l.action}</b> — {l.keterangan||"-"} <span className="text-xs text-muted-foreground">({new Date(l.createdAt).toLocaleString("id-ID")})</span></CardContent></Card>))}
      </div>
    </div>
  );
}
