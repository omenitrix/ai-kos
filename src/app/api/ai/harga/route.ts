import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hargaPasar } from "@/lib/ai";

export async function POST(req: Request) {
  const { area } = await req.json();
  if (!area) return NextResponse.json({ error: "area required" }, { status: 400 });
  // get kos in area (mock: we ignore area and use all for simplicity)
  const kos = await prisma.kosListing.findMany({ where: { status: "AKTIF" }, include: { kamar: true } });
  const data = hargaPasar(area, kos);
  return NextResponse.json(data);
}
