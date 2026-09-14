import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });

  const body = await req.json().catch(()=> ({}));
  const count = Math.min(20, Math.max(1, Number(body.count||12)));
  const statusMix = body.mix === "random" ? ["PENDING","SUCCESS","FAILED","REFUNDED"] as const : null;

  const kosList = await prisma.kosListing.findMany({ include: { kamar: true } });
  if (kosList.length===0) return NextResponse.json({ error: "Belum ada kos/kamar untuk mock" }, { status: 400 });
  const members = await prisma.user.findMany({ where: { role: { in: ["MEMBER","GUEST"] } } });
  const owners = await prisma.user.findMany({ where: { role: "OWNER" } });
  const payerPool = members.length ? members : await prisma.user.findMany({ take: 5 });

  const methods = ["VIRTUAL_ACCOUNT","TRANSFER_BANK","E_WALLET","QRIS"] as const;
  const statuses = ["PENDING","SUCCESS","FAILED"] as const;

  const created: any[] = [];
  for (let i=0;i<count;i++) {
    const kos = kosList[Math.floor(Math.random()*kosList.length)];
    const kamar = kos.kamar[0] ?? (await prisma.kamar.findFirst({ where: { kosId: kos.id } }));
    if (!kamar) continue;
    const payer = payerPool[Math.floor(Math.random()*payerPool.length)];
    const status = statusMix ? statusMix[Math.floor(Math.random()*statusMix.length)] : statuses[Math.floor(Math.random()*statuses.length)];
    const amount = kamar.hargaBulanan + Math.floor(Math.random()*200000);
    const durasi = 1 + Math.floor(Math.random()*3);
    const tglMulai = new Date(Date.now() - Math.floor(Math.random()*30)*86400000);
    const booking = await prisma.booking.create({
      data: {
        kosId: kos.id, kamarId: kamar.id, penyewaId: payer.id,
        tglMulai, durasiBulan: durasi, status: status==="SUCCESS" ? "ACTIVE" : status==="FAILED" ? "DIBATALKAN" : "PENDING_PAYMENT",
        totalHarga: amount*durasi,
      }
    });
    const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id, payerId: payer.id, amount, method: methods[Math.floor(Math.random()*methods.length)],
        status: status as any, invoiceNo, buktiBayar: status==="SUCCESS" ? `https://picsum.photos/seed/bukti-${invoiceNo}/400/200` : null,
        verifiedAt: status==="SUCCESS" ? new Date() : null,
      }
    });
    created.push(payment);
    // small delay uniqueness
    await new Promise(r=>setTimeout(r,10));
  }

  // also create 3 marketplace orders mock if empty
  const mCount = await prisma.marketplaceOrder.count();
  if (mCount===0) {
    const svc = await prisma.marketplaceService.findMany({ take: 3 });
    if (svc.length && payerPool.length) {
      for (const s of svc) {
        const payer = payerPool[Math.floor(Math.random()*payerPool.length)];
        await prisma.marketplaceOrder.create({ data: { serviceId: s.id, buyerId: payer.id, qty: 1+Math.floor(Math.random()*2), totalHarga: s.harga, status: "PENDING" } });
      }
    }
  }

  return NextResponse.json({ created: created.length, sample: created.slice(0,3) });
}
