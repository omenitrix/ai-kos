import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list owners" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || ""; // all | verified | unverified | suspended
  const where: any = { role: "OWNER" };
  if (q) where.OR = [{ name:{contains:q, mode:"insensitive"}},{ email:{contains:q, mode:"insensitive"}},{ username:{contains:q, mode:"insensitive"}},{ phone:{contains:q, mode:"insensitive"}}];
  if (status==="verified") where.isVerified=true;
  else if (status==="unverified") where.isVerified=false;
  else if (status==="suspended") where.isSuspended=true;
  else if (status==="active") where.isSuspended=false;

  const owners = await prisma.user.findMany({
    where,
    select: { id:true, name:true, username:true, email:true, phone:true, photo:true, isVerified:true, isSuspended:true, createdAt:true },
    orderBy: { createdAt:"desc" },
    take: 100,
  });
  const ids = owners.map(o=>o.id);
  const kosAgg = await prisma.kosListing.groupBy({ by:["ownerId"], where:{ ownerId:{ in: ids }}, _count:{ ownerId:true }});
  const kosMap = new Map(kosAgg.map(c=>[c.ownerId, c._count.ownerId]));
  const aktifAgg = await prisma.kosListing.groupBy({ by:["ownerId"], where:{ ownerId:{ in: ids }, status:"AKTIF"}, _count:{ ownerId:true }});
  const aktifMap = new Map(aktifAgg.map(c=>[c.ownerId, c._count.ownerId]));
  const pendingAgg = await prisma.kosListing.groupBy({ by:["ownerId"], where:{ ownerId:{ in: ids }, status:"PENDING_APPROVAL"}, _count:{ ownerId:true }});
  const pendingMap = new Map(pendingAgg.map(c=>[c.ownerId, c._count.ownerId]));
  const enriched = owners.map(o=>({ ...o, kosCount: kosMap.get(o.id)||0, kosAktif: aktifMap.get(o.id)||0, kosPending: pendingMap.get(o.id)||0 }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can perform this action" }, { status: 403 });
  const body = await req.json();
  if (!body.ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });
  const owner = await prisma.user.findUnique({ where: { id: body.ownerId } });
  if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  const data: any = {};
  if (typeof body.isVerified === "boolean") data.isVerified = body.isVerified;
  if (typeof body.isSuspended === "boolean") data.isSuspended = body.isSuspended;
  if (Object.keys(data).length===0) return NextResponse.json({ error:"No changes"}, {status:400});
  const updated = await prisma.user.update({ where: { id: body.ownerId }, data });
  try { await prisma.adminLog.create({ data: { adminId:(session.user as any).id, action:`UPDATE_OWNER:${Object.keys(data).join(",")}`, targetId: body.ownerId, targetType:"User", keterangan: JSON.stringify(data) }});} catch {}
  return NextResponse.json(updated);
}
