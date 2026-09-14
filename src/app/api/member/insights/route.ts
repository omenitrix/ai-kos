import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const bookings = await prisma.booking.findMany({ where: { penyewaId: userId }, include: { kos: { include: { kamar: true } }, kamar: true, payments: true }, orderBy: { createdAt: "desc" } }).catch(()=>[] as any[]);
  const payments = await prisma.payment.findMany({ where: { payerId: userId }, orderBy: { createdAt: "desc" } }).catch(()=>[] as any[]);

  const active = bookings.find((b:any)=>b.status==="ACTIVE"||b.status==="DRAFT");
  const riwayat = bookings;
  const totalBayar = payments.filter((p:any)=>p.status==="SUCCESS").reduce((s:number,p:any)=>s+p.amount,0);

  // jatuh tempo: dari tglMulai + durasi
  let jatuhTempo: string | null = null;
  let sisaHari: number | null = null;
  if (active) {
    const start = new Date(active.tglMulai);
    const due = new Date(start); due.setMonth(due.getMonth() + (active.durasiBulan||1));
    jatuhTempo = due.toISOString().slice(0,10);
    sisaHari = Math.max(0, Math.ceil((due.getTime() - Date.now())/(1000*60*60*24)));
  }

  // histori dilihat — mock dari bookings + kos lain
  const dilihat = bookings.slice(0,3).map((b:any)=>({ nama: b.kos?.nama, alamat: b.kos?.alamat, harga: b.kamar?.hargaBulanan }));

  // transparansi harga area
  let avgPasar: number | null = null;
  if (active?.kos?.alamat) {
    const city = active.kos.alamat.split(",").pop()?.trim() || "";
    const areaKos = await prisma.kosListing.findMany({ where: city?{ alamat: { contains: city } }:{}, include: { kamar: true } }).catch(()=>[] as any[]);
    const kamarArea = areaKos.flatMap((k:any)=>k.kamar);
    if (kamarArea.length) avgPasar = Math.round(kamarArea.reduce((s:number,k:any)=>s+k.hargaBulanan,0)/kamarArea.length);
  }

  // rekomendasi: kos lain dengan harga mirip
  const rekom = await prisma.kosListing.findMany({ where: { status: "AKTIF" as any }, include: { kamar: true }, take: 3 }).catch(()=>[] as any[]);
  const rekomendasi = rekom.filter((k:any)=>k.id!==active?.kosId).slice(0,3).map((k:any)=>({ id:k.id, slug:k.slug, nama:k.nama, alamat:k.alamat, harga: k.kamar[0]?.hargaBulanan, foto:k.fotoSampul }));

  return NextResponse.json({
    sewaAktif: active ? { kos: active.kos?.nama, alamat: active.kos?.alamat, kamar: active.kamar?.nomor, harga: active.kamar?.hargaBulanan, tglMulai: active.tglMulai, tglSelesai: active.tglSelesai, status: active.status, jatuhTempo, sisaHari } : null,
    riwayat: riwayat.map((b:any)=>({ id:b.id, kos:b.kos?.nama, kamar:b.kamar?.nomor, harga:b.totalHarga, status:b.status, tglMulai:b.tglMulai })),
    pembayaran: payments.slice(0,10).map((p:any)=>({ id:p.id, amount:p.amount, status:p.status, method:p.method, createdAt:p.createdAt })),
    totalBayar,
    dilihat,
    hargaArea: avgPasar ? { avgPasar, hargaSaya: active?.kamar?.hargaBulanan, selisih: active?.kamar?.hargaBulanan && avgPasar ? Math.round(((active.kamar.hargaBulanan-avgPasar)/avgPasar)*100) : 0 } : null,
    rekomendasi,
  });
}
