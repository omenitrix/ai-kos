import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function OwnerKosDetail({ params }: { params: { id: string } }) {
  const kos = { id: params.id, nama: "Kos Aman Sentosa", alamat: "Jl. Merdeka No.10", deskripsi: "Kos nyaman dengan fasilitas lengkap.", foto: "https://picsum.photos/seed/kos1/400/300", status: "AKTIF" };
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/owner/kos" className="text-sm text-muted-foreground hover:underline">&larr; Kembali ke Daftar Kos</Link>
        <h1 className="mt-2 text-2xl font-bold">{kos.nama}</h1>
        <p className="text-muted-foreground">{kos.alamat}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Informasi Kos</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Status:</strong> <span className={`${kos.status === "AKTIF" ? "text-green-600" : "text-red-600"}`}>{kos.status}</span></p>
              <p><strong>Deskripsi:</strong> {kos.deskripsi}</p>
              <p><strong>Foto Sampul:</strong></p>
              <Image src={kos.foto} alt={kos.nama || "kos"} width={400} height={300} className="rounded-lg w-full h-48 object-cover" unoptimized />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Pengelolaan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/owner/kos/${kos.id}/kamar`}>
                <Button className="w-full">Kelola Kamar ({kos.id === "1" ? "5" : "0"} kamar)</Button>
              </Link>
              <Link href={`/dashboard/owner/kos/${kos.id}/kamar/add`}>
                <Button variant="outline" className="w-full">+ Tambah Kamar</Button>
              </Link>
              <Link href={`/dashboard/owner/kos/${kos.id}/promo`}>
                <Button className="w-full mt-2">Kelola Promo</Button>
              </Link>
              <Link href={`/dashboard/owner/kos/${kos.id}/bookings`}>
                <Button className="w-full mt-2">Lihat Booking Masuk</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Pratinjau Kos (untuk Penyewa)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Image src={kos.foto} alt={kos.nama || "kos"} width={400} height={300} className="rounded-lg w-full h-60 object-cover" unoptimized />
                <h2 className="text-xl font-bold">{kos.nama}</h2>
                <p className="text-muted-foreground">{kos.alamat}</p>
                <p className="mt-2">{kos.deskripsi}</p>
                <div className="mt-4 flex items-center space-x-4">
                  <Button variant="outline" size="sm">Hubungi Owner</Button>
                  <Button size="sm">Lihat Detail & Booking</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
