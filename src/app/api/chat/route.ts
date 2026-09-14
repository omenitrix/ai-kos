import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const threads = await prisma.chatThread.findMany({
    where: { OR: [{ memberId: userId }, { ownerId: userId }] },
    include: { kos: { select: { nama: true, slug: true } }, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(threads);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.kosId || !body.memberId || !body.content) return NextResponse.json({ error: "kosId, memberId, content required" }, { status: 400 });
  const kos = await prisma.kosListing.findUnique({ where: { id: body.kosId } });
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  // determine ownerId from kos
  const ownerId = kos.ownerId;
  // ensure member is the logged-in user (or admin can chat as any?)
  const userId = (session.user as any).id;
  const role = (session.user as any).role;
  if (role !== "ADMIN" && body.memberId !== userId) return NextResponse.json({ error: "Forbidden: can only chat as yourself" }, { status: 403 });
  // find or create thread
  let thread = await prisma.chatThread.findFirst({ where: { kosId: body.kosId, memberId: body.memberId, ownerId } });
  if (!thread) {
    thread = await prisma.chatThread.create({ data: { kosId: body.kosId, memberId: body.memberId, ownerId } });
  }
  const message = await prisma.chatMessage.create({
    data: { threadId: thread.id, senderId: userId, content: body.content },
  });
  // update thread updatedAt
  await prisma.chatThread.update({ where: { id: thread.id }, data: { updatedAt: new Date() } });
  return NextResponse.json({ thread, message });
}
