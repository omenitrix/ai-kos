import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const gender = searchParams.get("gender") || undefined;
  const where: any = { status: "AKTIF" };
  if (q) where.OR = [{ nama: { contains: q, mode: "insensitive" } }, { alamat: { contains: q, mode: "insensitive" } }];
  if (gender) where.genderType = gender;
  let listings = await prisma.kosListing.findMany({
    where,
    include: { kamar: true, owner: { select: { name: true, phone: true } } },
  });
  if (minPrice || maxPrice) {
    listings = listings.filter((l) => {
      const prices = l.kamar.map((k) => k.hargaBulanan);
      if (!prices.length) return false;
      const min = Math.min(...prices);
      return (!minPrice || min >= +minPrice) && (!maxPrice || min <= +maxPrice);
    });
  }
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.user as any).role !== "OWNER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  // simple validation
  if (!body?.nama || body.nama.length < 3) return NextResponse.json({ error: "Nama kos minimal 3 karakter" }, { status: 400 });
  if (!body?.alamat || body.alamat.length < 5) return NextResponse.json({ error: "Alamat minimal 5 karakter" }, { status: 400 });
  const kos = await prisma.kosListing.create({
    data: {
      nama: body.nama,
      alamat: body.alamat,
      deskripsi: body.deskripsi ?? null,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      fotoSampul: body.fotoSampul ?? null,
      fotoList: body.fotoList ?? [],
      video: body.video ?? null,
      genderType: body.genderType ?? "CAMPUR",
      owner: { connect: { id: (session.user as any).id } },
      slug: slugify(body.nama) + "-" + Date.now().toString(36),
      status: "PENDING_APPROVAL",
    },
  });
  return NextResponse.json(kos);
}
