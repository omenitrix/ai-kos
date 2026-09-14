"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerKosList() {
  const kosList = [
    { id: "1", nama: "Kos Aman Sentosa", alamat: "Jl. Merdeka No.10", foto: "https://picsum.photos/seed/kos1/200/150", status: "AKTIF" },
    { id: "2", nama: "Kos Elite Cempaka", alamat: "Jl. Cempaka No.5", foto: "https://picsum.photos/seed/kos2/200/150", status: "NONAKTIF" },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daftar Kos Saya</h2>
        <Link href="/dashboard/owner/kos/add">
          <Button>+ Tambah Kos Baru</Button>
        </Link>
      </div>
      <div className="space-y-4">
        {kosList.map((k) => (
          <Card key={k.id} className="border">
            <CardHeader className="flex items-center p-4">
              <img src={k.foto} alt={k.nama} className="w-16 h-16 object-cover rounded mr-4" />
              <div>
                <CardTitle className="text-base">{k.nama}</CardTitle>
                <p className="text-sm text-muted-foreground">{k.alamat}</p>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs ${k.status === "AKTIF" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {k.status === "AKTIF" ? "Aktif" : "Tidak Aktif"}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Link href={`/dashboard/owner/kos/${k.id}`} className="text-sm text-primary hover:underline">
                Lihat Detail & Kelola Kamar
              </Link>
              <div className="mt-2 flex justify-end space-x-2">
                <Link href={`/dashboard/owner/kos/${k.id}/edit`}>
                  <Button size="sm" variant="outline">Edit</Button>
                </Link>
                <Button size="sm" variant="outline" onClick={()=>{/* TODO: confirm */}}>
                  Nonaktifkan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
