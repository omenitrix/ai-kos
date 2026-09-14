"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function PembayaranDetail({ params }: { params: { id: string } }) {
  const payment = { id: params.id, amount: 1500000, status: "PENDING", dueDate: "2026-10-05", booking: { kos: { nama: "Kos Aman Sentosa" }, kamar: { nomor: "A-01" } } };
  const [uploaded, setUploaded] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // mock upload
    setUploaded(true);
    // In real app, we would call /api/pembayaran/[id] with formData
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Tagihan Pembayaran</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p><strong>Kos:</strong> {payment.booking.kos.nama}</p>
            <p><strong>Kamar:</strong> {payment.booking.kamar.nomor}</p>
            <p><strong>Jumlah Tagihan:</strong> <span className="text-xl font-bold text-primary">Rp {payment.amount.toLocaleString("id-ID")}</span></p>
            <p><strong>Jatuh Tempo:</strong> {payment.dueDate}</p>
            <p><strong>Status:</strong> <span className={`${payment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" : ""} px-2 py-0.5 rounded-full text-xs`}>
              {payment.status === "PENDING" ? "Menunggu Pembayaran" : payment.status === "SUCCESS" ? "Lunas" : "Gagal"}
            </span></p>
          </div>
          {payment.status === "PENDING" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Bukti Pembayaran</h3>
              <p className="text-sm text-muted-foreground">
                Upload screenshot atau foto transfer bank, e-wallet, atau QRIS.
              </p>
              <input type="file" accept="image/*" onChange={handleUpload} className="block w-full text-sm text-muted-foreground" />
              {uploaded && (
                <p className="text-sm text-green-600">Bukti berhasil diunggah! Tim akan memverifikasi dalam 1x24 jam.</p>
              )}
              <Button onClick={()=>{/* submit for verification */}} className="w-full">
                Kirim untuk Verifikasi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
