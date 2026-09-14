import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnerKamarList({ params }: { params: { id: string } }) {
  const kamarList = [
    { id: "k1", nomor: "A-01", tipe: "Kost Putri", luasM2: 12, furnished: true, ac: true, wifi: true, hargaBulanan: 1500000, tersedia: true },
    { id: "k2", nomor: "A-02", tipe: "Kost Putri", luasM2: 12, furnished: true, ac: true, wifi: true, hargaBulanan: 1500000, tersedia: false },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Daftar Kamar</h2>
        <Link href={`/dashboard/owner/kos/${params.id}/kamar/add`}>
          <Button>+ Tambah Kamar</Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Kamar</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Luas (m²)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Furnitur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">AC/WiFi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga/Bulan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kamarList.map((k) => (
              <tr key={k.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{k.nomor}</td>
                <td className="px-6 py-4 whitespace-nowrap">{k.tipe}</td>
                <td className="px-6 py-4 whitespace-nowrap">{k.luasM2}</td>
                <td className="px-6 py-4 whitespace-nowrap">{k.furnished ? "Ya" : "Tidak"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{k.ac && k.wifi ? "Ya" : "Tidak"}</td>
                <td className="px-6 py-4 whitespace-nowrap">Rp {k.hargaBulanan.toLocaleString("id-ID")}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${k.tersedia ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {k.tersedia ? "Tersedia" : "Terisi"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link href={`/dashboard/owner/kos/${params.id}/kamar/${k.id}/edit`}>
                    <Button size="sm" variant="outline">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
