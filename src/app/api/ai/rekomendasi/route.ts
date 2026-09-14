import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recommendKos } from "@/lib/ai";

export async function POST(req: Request) {
  const { filters, limit = 6 } = await req.json();
  // get all active kos (in real app, we would filter by fields like price range, gender, etc.)
  const kos = await prisma.kosListing.findMany({ where: { status: "AKTIF" }, include: { kamar: true } });
  const recommended = recommendKos(filters, kos);
  return NextResponse.json({ recommended: recommended.slice(0, limit) });
}
