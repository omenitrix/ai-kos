import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can view logs" }, { status: 403 });
  const logs = await prisma.adminLog.findMany({ include: { admin: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(logs);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can create log" }, { status: 403 });
  const body = await req.json();
  const log = await prisma.adminLog.create({ data: { adminId: (session.user as any).id, action: body.action || "MANUAL_LOG", targetId: body.targetId ?? null, targetType: body.targetType ?? null, keterangan: body.keterangan ?? null } });
  return NextResponse.json(log);
}
