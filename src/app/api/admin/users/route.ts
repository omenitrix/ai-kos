import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list users" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const filterRole = searchParams.get("role") || "";
  const filterStatus = searchParams.get("status") || ""; // all | verified | unverified | suspended | active
  const where: Prisma.UserWhereInput = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
      { username: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ];
  }
  if (filterRole) where.role = filterRole as any;
  if (filterStatus === "suspended") where.isSuspended = true;
  else if (filterStatus === "active") where.isSuspended = false;
  else if (filterStatus === "verified") where.isVerified = true;
  else if (filterStatus === "unverified") where.isVerified = false;

  const users = await prisma.user.findMany({
    where,
    select: { id: true, name: true, username: true, email: true, phone: true, photo: true, role: true, isVerified: true, isSuspended: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  // enrich with counts
  const ids = users.map(u=>u.id);
  const kosCounts = await prisma.kosListing.groupBy({ by: ["ownerId"], where: { ownerId: { in: ids } }, _count: { ownerId: true } });
  const kosMap = new Map(kosCounts.map(c=>[c.ownerId, c._count.ownerId]));
  const bookingCounts = await prisma.booking.groupBy({ by: ["penyewaId"], where: { penyewaId: { in: ids } }, _count: { penyewaId: true } });
  const bookMap = new Map(bookingCounts.map(c=>[c.penyewaId, c._count.penyewaId]));
  const enriched = users.map(u=>({ ...u, kosCount: kosMap.get(u.id)||0, bookingCount: bookMap.get(u.id)||0 }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can perform this action" }, { status: 403 });
  const body = await req.json();
  if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  // prevent admin suspending self
  if (body.userId === (session.user as any).id && body.isSuspended === true) return NextResponse.json({ error: "Tidak bisa suspend diri sendiri" }, { status: 400 });
  const data: any = {};
  if (typeof body.isSuspended === "boolean") data.isSuspended = body.isSuspended;
  if (typeof body.isVerified === "boolean") data.isVerified = body.isVerified;
  if (typeof body.role === "string" && ["GUEST","MEMBER","OWNER","ADMIN"].includes(body.role)) data.role = body.role;
  if (Object.keys(data).length===0) return NextResponse.json({ error: "No changes" }, { status: 400 });
  const updated = await prisma.user.update({ where: { id: body.userId }, data });
  // log
  try { await prisma.adminLog.create({ data: { adminId: (session.user as any).id, action: `UPDATE_USER:${Object.keys(data).join(",")}`, targetId: body.userId, targetType: "User", keterangan: JSON.stringify(data) } }); } catch {}
  return NextResponse.json(updated);
}
