import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list transaksi" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const kosId = searchParams.get("kosId");
  const where = kosId ? { booking: { kosId } } : {};
  const payments = await prisma.payment.findMany({ where, include: { booking: { include: { kos: true, kamar: true, penyewa: { select: { name: true, email: true } } } }, payer: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(payments);
}
