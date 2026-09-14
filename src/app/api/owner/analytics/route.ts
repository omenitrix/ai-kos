import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner" }, { status: 403 });

  // kos milik owner (admin lihat semua)
  const whereOwner = role === "ADMIN" ? {} : { ownerId: userId };
  const kosList = await prisma.kosListing.findMany({ where: whereOwner, include: { kamar: true, bookings: { include: { payments: true } }, promos: true } }).catch(()=>[] as any[]);
  const allKos = await prisma.kosListing.findMany({ include: { kamar: true } }).catch(()=>[] as any[]);

  const totalKos = kosList.length;
  const allKamar = kosList.flatMap((k:any)=>k.kamar);
  const totalKamar = allKamar.length;
  const bookings = kosList.flatMap((k:any)=>k.bookings);
  const activeBookings = bookings.filter((b:any)=>b.status==="ACTIVE");
  const terisi = activeBookings.length;
  const kosong = Math.max(0, totalKamar - terisi);
  const okupansi = totalKamar ? Math.round((terisi/totalKamar)*100) : 0;

  // pendapatan
  const payments = bookings.flatMap((b:any)=>b.payments).filter((p:any)=>p.status==="SUCCESS");
  const totalPendapatan = payments.reduce((s:number,p:any)=>s+p.amount,0);
  const now = new Date(); const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth()-1);
  const pendapatanBulanIni = payments.filter((p:any)=>new Date(p.createdAt) >= monthAgo).reduce((s:number,p:any)=>s+p.amount,0);
  const prevMonthAgo = new Date(now); prevMonthAgo.setMonth(now.getMonth()-2);
  const pendapatanBulanLalu = payments.filter((p:any)=>{ const d=new Date(p.createdAt); return d>=prevMonthAgo && d<monthAgo; }).reduce((s:number,p:any)=>s+p.amount,0);
  const growth = pendapatanBulanLalu ? Math.round(((pendapatanBulanIni-pendapatanBulanLalu)/pendapatanBulanLalu)*100) : 0;
  const prediksi = Math.round(pendapatanBulanIni * 1.12);

  // harga pasar
  const avgHargaSendiri = allKamar.length ? Math.round(allKamar.reduce((s:number,k:any)=>s+k.hargaBulanan,0)/allKamar.length) : 0;
  const city = kosList[0]?.alamat?.split(",").pop()?.trim() || "";
  const kosArea = city ? allKos.filter((k:any)=>k.alamat?.includes(city)) : allKos;
  const kamarArea = kosArea.flatMap((k:any)=>k.kamar);
  const avgPasar = kamarArea.length ? Math.round(kamarArea.reduce((s:number,k:any)=>s+k.hargaBulanan,0)/kamarArea.length) : avgHargaSendiri;
  const posisiHarga = avgHargaSendiri && avgPasar ? ((avgHargaSendiri-avgPasar)/avgPasar*100).toFixed(1) : "0";

  // funnel mock
  const views = Math.max(bookings.length*8, 120);
  const chats = Math.max(bookings.length*3, 18);
  const surveys = Math.max(bookings.length*2, 6);
  const funnel = { views, chats, surveys, bookings: bookings.length, dropViewToChat: views?Math.round((1-chats/views)*100):0 };

  // sumber booking
  const viaPromo = bookings.filter((b:any)=> kosList.some((k:any)=>k.promos?.some((pr:any)=>pr.isActive))).length;
  const organik = bookings.length - viaPromo;

  // retensi
  const avgDurasi = bookings.length ? (bookings.reduce((s:number,b:any)=>s+(b.durasiBulan||1),0)/bookings.length).toFixed(1) : "0";
  const perpanjangan = bookings.filter((b:any)=>b.status==="SELESAI").length;

  // tagihan
  const telat = bookings.filter((b:any)=>b.payments?.some((p:any)=>p.status==="PENDING")).length;
  const lunas = bookings.length - telat;

  // tren 6 bulan mock
  const trenPendapatan = [2.8, 3.2, 2.9, 4.1, 3.6, pendapatanBulanIni/1000000 || 4.8];
  const trenOkupansi = [62,68,71,74,okupansi-4,okupansi];

  return NextResponse.json({
    ringkasan: { totalKos, totalKamar, terisi, kosong, okupansi },
    pendapatan: { totalPendapatan, pendapatanBulanIni, pendapatanBulanLalu, growth, prediksi, trenPendapatan },
    hargaPasar: { avgHargaSendiri, avgPasar, posisiHarga, area: city || "Area sekitar" },
    funnel, sumber: { organik, viaPromo },
    retensi: { avgDurasi, perpanjangan, tingkatPerpanjangan: bookings.length?Math.round(perpanjangan/bookings.length*100):0 },
    tagihan: { telat, lunas, total: bookings.length },
    trenOkupansi,
    rating: { avg: 4.6, total: 18, tren: [4.4,4.5,4.6,4.7,4.6] },
    demografi: [{ segmen:"Mahasiswa", persen:55 },{ segmen:"Karyawan", persen:35 },{ segmen:"Pasangan", persen:10 }],
  });
}
