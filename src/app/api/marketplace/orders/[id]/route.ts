import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const ALLOWED = ["PENDING","CONFIRMED","PROCESSING","COMPLETED","CANCELLED","REFUNDED"] as const;

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  const order = await prisma.marketplaceOrder.findUnique({ where: { id: params.id }, include: { service: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // buyer boleh cancel sendiri kalau masih PENDING
  const body = await req.json();
  const newStatus = body.status;
  if (!ALLOWED.includes(newStatus)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });

  if (role === "ADMIN") {
    // admin bebas semua
  } else if (role === "OWNER") {
    // owner hanya untuk layanan kos miliknya
    if (!order.service.kosId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const kos = await prisma.kosListing.findUnique({ where: { id: order.service.kosId } });
    if (!kos || kos.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // owner tidak boleh REFUNDED kalau bukan admin? boleh tapi batasi — allow
  } else {
    // member/guest — hanya boleh CANCELLED dari PENDING, atau pemilik order
    if (order.buyerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!(order.status==="PENDING" && newStatus==="CANCELLED")) return NextResponse.json({ error: "Kamu hanya bisa membatalkan pesanan yang masih pending" }, { status: 403 });
  }

  const updated = await prisma.marketplaceOrder.update({ where: { id: params.id }, data: { status: newStatus }, include: { service: true, buyer: { select: { email:true, name:true } } } });
  return NextResponse.json(updated);
}
