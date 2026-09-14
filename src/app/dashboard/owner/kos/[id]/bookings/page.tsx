import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function OwnerBookings({ params }: { params: { id: string } }) {
  const list = [
    { id:"b1", penyewa:"Budi", kamar:"A-01", tgl:"2026-09-01", status:"ACTIVE" },
    { id:"b2", penyewa:"Sari", kamar:"B-01", tgl:"2026-09-05", status:"PENDING_PAYMENT" },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href={`/dashboard/owner/kos/${params.id}`} className="text-sm text-muted-foreground hover:underline">&larr; Kembali</Link>
      <h1 className="mt-2 text-xl font-bold">Booking Masuk — Kos {params.id}</h1>
      <div className="mt-4 space-y-3">
        {list.map(b=>(
          <Card key={b.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="font-medium">{b.penyewa} — Kamar {b.kamar}</div><div className="text-sm text-muted-foreground">{b.tgl} • {b.status}</div></div><div className="flex gap-2"><Button size="sm">Approve</Button><Button size="sm" variant="outline">Chat</Button></div></CardContent></Card>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">Data live via GET /api/penyewaan (owner ter-filter otomatis).</p>
    </div>
  );
}
