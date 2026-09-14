"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function AdminListings() {
  const [list,setList]=useState<any[]>([]);
  useEffect(()=>{ fetch("/api/admin/listings").then(r=>r.json()).then(d=>Array.isArray(d)?setList(d):setList([])).catch(()=>setList([])); },[]);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/dashboard/admin" className="text-sm text-muted-foreground hover:underline">&larr; Dashboard Admin</Link>
      <h1 className="mt-2 text-xl font-bold">Approval Listing Kos Baru</h1>
      <div className="mt-4 grid gap-3">
        {list.length===0 ? <p className="text-sm text-muted-foreground">Tidak ada kos pending.</p> : list.map((k:any)=>(
          <Card key={k.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="font-medium">{k.nama}</div><div className="text-xs text-muted-foreground">{k.alamat} — owner: {k.owner?.email}</div></div><div className="flex gap-2"><Button size="sm" onClick={async()=>{await fetch("/api/admin/listings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kosId:k.id,status:"AKTIF"})}); location.reload();}}>Approve</Button><Button size="sm" variant="outline" onClick={async()=>{await fetch("/api/admin/listings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kosId:k.id,status:"NONAKTIF"})}); location.reload();}}>Tolak</Button></div></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
