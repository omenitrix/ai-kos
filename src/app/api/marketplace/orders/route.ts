import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  if (role === "ADMIN") {
    const orders = await prisma.marketplaceOrder.findMany({
      include: { service: { include: { kos: { select: { nama: true, slug: true } } } }, buyer: { select: { email: true, name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  }
  if (role === "OWNER") {
    // hanya pesanan untuk marketplace milik kos owner
    const ownedKosIds = (await prisma.kosListing.findMany({ where: { ownerId: userId }, select: { id: true } })).map(k=>k.id);
    const serviceIds = (await prisma.marketplaceService.findMany({ where: { kosId: { in: ownedKosIds } }, select: { id: true } })).map(s=>s.id);
    const orders = await prisma.marketplaceOrder.findMany({
      where: { serviceId: { in: serviceIds } },
      include: { service: { include: { kos: { select: { nama: true, slug: true } } } }, buyer: { select: { email: true, name: true, phone: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  }
  // member/guest — hanya pesanan sendiri
  const orders = await prisma.marketplaceOrder.findMany({
    where: { buyerId: userId },
    include: { service: { include: { kos: { select: { nama: true, slug: true } } } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const serviceId = body.serviceId;
  const qty = Math.max(1, Number(body.qty||1));
  const catatan = body.catatan || null;
  if (!serviceId) return NextResponse.json({ error: "serviceId required" }, { status: 400 });
  const svc = await prisma.marketplaceService.findUnique({ where: { id: serviceId } });
  if (!svc || !svc.isActive) return NextResponse.json({ error: "Layanan tidak tersedia" }, { status: 404 });
  const totalHarga = svc.harga * qty;
  const order = await prisma.marketplaceOrder.create({
    data: { serviceId, buyerId: (session.user as any).id, qty, totalHarga, catatan },
    include: { service: true },
  });
  return NextResponse.json(order);
}
