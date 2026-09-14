// @ts-nocheck
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const item = await prisma.marketplaceService.findUnique({ where: { id: params.id }, include: { kos: { select: { nama: true, slug: true } } } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Only owner/admin can update marketplace item" }, { status: 403 });
  const item = await prisma.marketplaceService.findUnique({ where: { id: params.id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.kosId) {
    const kos = await prisma.kosListing.findUnique({ where: { id: item.kosId } });
    if (kos && role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const updated = await prisma.marketplaceService.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ error: "DELETE disabled (aturan: tidak menghapus file/data)" }, { status: 405 });
}
