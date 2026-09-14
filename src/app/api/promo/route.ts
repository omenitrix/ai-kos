import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kosId = searchParams.get("kosId");
  const where = kosId ? { kosId, isActive: true } : { isActive: true };
  const promos = await prisma.promo.findMany({ where, include: { kos: { select: { nama: true, slug: true } } }, orderBy: { masaBerlakuAkhir: "desc" } });
  return NextResponse.json(promos);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner/admin can create promo" }, { status: 403 });
  const body = await req.json();
  if (!body.kosId) return NextResponse.json({ error: "kosId required" }, { status: 400 });
  const kos = await prisma.kosListing.findUnique({ where: { id: body.kosId } });
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const promo = await prisma.promo.create({ data: { ...body, kosId: body.kosId } });
  return NextResponse.json(promo);
}
