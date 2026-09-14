import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const kamar = await prisma.kamar.findMany({ where: { kosId: params.id } });
  return NextResponse.json(kamar);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kos = await prisma.kosListing.findUnique({ where: { id: params.id } });
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  const role = (session.user as any).role;
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  // basic validation
  if (!body.hargaBulanan || body.hargaBulanan < 100000) return NextResponse.json({ error: "Harga bulanan minimal 100.000" }, { status: 400 });
  const kamar = await prisma.kamar.create({
    data: { ...body, kosId: params.id },
  });
  return NextResponse.json(kamar);
}
