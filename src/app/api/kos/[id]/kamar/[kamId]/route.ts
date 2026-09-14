import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string; kamId: string } }) {
  const kamar = await prisma.kamar.findFirst({ where: { id: params.kamId, kosId: params.id } });
  if (!kamar) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(kamar);
}

export async function PUT(req: Request, { params }: { params: { id: string; kamId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kos = await prisma.kosListing.findUnique({ where: { id: params.id } });
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  const role = (session.user as any).role;
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const kamar = await prisma.kamar.update({ where: { id: params.kamId }, data: body });
  return NextResponse.json(kamar);
}

export async function DELETE(req: Request, { params }: { params: { id: string; kamId: string } }) {
  // FORBIDDEN per SCOPE LOCK: tidak menghapus file/data
  return NextResponse.json({ error: "DELETE disabled (aturan: tidak menghapus file/data)" }, { status: 405 });
}
