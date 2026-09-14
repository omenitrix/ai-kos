import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payment = await prisma.payment.findUnique({ where: { id: params.id }, include: { booking: { include: { kos: true, kamar: true } }, payer: { select: { id: true, name: true, email: true, photo: true } } } });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "ADMIN" && payment.payerId !== userId && payment.booking.kos.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(payment);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // only admin can verify payment (manual) or we could have webhook from gateway
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can verify payment" }, { status: 403 });
  const body = await req.json();
  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.payment.update({ where: { id: params.id }, data: { status: body.status, verifiedAt: body.status === "SUCCESS" ? new Date() : null } });
  // if payment success, update booking status to ACTIVE
  if (body.status === "SUCCESS") {
    await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "ACTIVE" } });
  }
  return NextResponse.json(updated);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // upload bukti bayar (mock)
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const payment = await prisma.payment.findUnique({ where: { id: params.id } });
  if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if (payment.payerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // In real app, we would handle file upload here; for mock we just update a flag
  const updated = await prisma.payment.update({ where: { id: params.id }, data: { buktiBayar: "mock-upload-url" } });
  return NextResponse.json(updated);
}
