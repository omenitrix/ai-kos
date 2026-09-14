import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const kos = await prisma.kosListing.findFirst({ where: { OR: [{ id: params.id }, { slug: params.id }] }, include: { kamar: true, owner: { select: { name: true, phone: true, email: true } }, promos: true, marketplace: true } });
  if (!kos) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(kos);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kos = await prisma.kosListing.findUnique({ where: { id: params.id } });
  if (!kos) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const role = (session.user as any).role;
  if (role !== "ADMIN" && kos.ownerId !== (session.user as any).id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const kos2 = await prisma.kosListing.update({ where: { id: params.id }, data: { nama: body.nama, alamat: body.alamat, deskripsi: body.deskripsi, latitude: body.latitude, longitude: body.longitude, fotoSampul: body.fotoSampul, fotoList: body.fotoList, video: body.video, genderType: body.genderType, status: body.status, isFeatured: body.isFeatured } });
  return NextResponse.json(kos2);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  // DISABLED per SCOPE LOCK: tidak menghapus data
  return NextResponse.json({ error: "DELETE disabled (aturan: tidak menghapus file/data)" }, { status: 405 });
}
