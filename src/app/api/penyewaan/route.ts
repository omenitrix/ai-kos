import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  let bookings;
  if (role === "OWNER") {
    // get bookings for kos owned by this owner
    const kosIds = await prisma.kosListing.findMany({ where: { ownerId: userId }, select: { id: true } });
    const kosIdArray = kosIds.map(k => k.id);
    bookings = await prisma.booking.findMany({ where: { kosId: { in: kosIdArray } }, include: { kamar: true, penyewa: { select: { id: true, name: true, email: true, photo: true } } } });
  } else if (role === "ADMIN") {
    bookings = await prisma.booking.findMany({ include: { kos: true, kamar: true, penyewa: true } });
  } else {
    // member/guest
    bookings = await prisma.booking.findMany({ where: { penyewaId: userId }, include: { kos: true, kamar: true } });
  }
  return NextResponse.json(bookings);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "MEMBER" && role !== "OWNER") return NextResponse.json({ error: "Only member/owner can create booking" }, { status: 403 });
  const body = await req.json();
  // basic validation
  if (!body.kosId || !body.kamarId || !body.tglMulai) return NextResponse.json({ error: "kosId, kamarId, tglMulai required" }, { status: 400 });
  const kamar = await prisma.kamar.findUnique({ where: { id: body.kamarId } });
  if (!kamar) return NextResponse.json({ error: "Kamar not found" }, { status: 404 });
  if (!kamar.tersedia) return NextResponse.json({ error: "Kamar tidak tersedia" }, { status: 400 });
  const totalHarga = kamar.hargaBulanan * (body.durasiBulan || 1);
  const booking = await prisma.booking.create({
    data: {
      kosId: body.kosId,
      kamarId: body.kamarId,
      penyewaId: (session.user as any).id,
      tglMulai: new Date(body.tglMulai),
      tglSelesai: body.tglSelesai ? new Date(body.tglSelesai) : undefined,
      durasiBulan: body.durasiBulan || 1,
      totalHarga,
      status: "DRAFT", // will go to PENDING_PAYMENT after payment initiated
    },
  });
  return NextResponse.json(booking);
}
