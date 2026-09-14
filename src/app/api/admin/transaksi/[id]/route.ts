import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const body = await req.json();
  const status = body.status;
  if (!["PENDING","SUCCESS","FAILED","REFUNDED"].includes(status)) return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  const updated = await prisma.payment.update({
    where: { id: params.id },
    data: { status, verifiedAt: status==="SUCCESS" ? new Date() : null },
    include: { booking: { include: { kos: { select: { nama:true, slug:true } }, kamar: true } }, payer: { select: { email:true, name:true } } },
  });
  return NextResponse.json(updated);
}
