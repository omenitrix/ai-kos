import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { kos: true, kamar: true, penyewa: true, payments: true } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "ADMIN" && booking.penyewaId !== userId && booking.kos.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(booking);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const booking = await prisma.booking.findUnique({ where: { id: params.id }, include: { kos: true } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if (role !== "ADMIN" && booking.penyewaId !== userId && booking.kos.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  // allowed status transitions: DRAFT -> PENDING_PAYMENT -> ACTIVE -> SELESAI/DIBATALKAN
  if (body.status) {
    const allowed = ["PENDING_PAYMENT", "ACTIVE", "SELESAI", "DIBATALKAN"];
    if (!allowed.includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const updated = await prisma.booking.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}
