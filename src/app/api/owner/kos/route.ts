import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  const userId = (session.user as any).id;
  if (role !== "OWNER" && role !== "ADMIN") return NextResponse.json({ error: "Forbidden — hanya OWNER" }, { status: 403 });
  const where = role === "ADMIN" ? {} : { ownerId: userId };
  const list = await prisma.kosListing.findMany({
    where,
    include: { kamar: { select: { id: true, hargaBulanan: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(list);
}
