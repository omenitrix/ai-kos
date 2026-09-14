import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list pending kos" }, { status: 403 });
  const kos = await prisma.kosListing.findMany({ where: { status: "PENDING_APPROVAL" }, include: { owner: { select: { name: true, email: true } } } });
  return NextResponse.json(kos);
}

export async function POST(req: Request) {
  // admin approve/reject kos
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can perform this action" }, { status: 403 });
  const body = await req.json();
  if (!body.kosId) return NextResponse.json({ error: "kosId required" }, { status: 400 });
  const kos = await prisma.kosListing.findUnique({ where: { id: body.kosId } });
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  const updated = await prisma.kosListing.update({ where: { id: body.kosId }, data: { status: body.status ?? "AKTIF" } });
  return NextResponse.json(updated);
}
