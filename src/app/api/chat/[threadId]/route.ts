import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { threadId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const thread = await prisma.chatThread.findUnique({ where: { id: params.threadId }, include: { messages: { orderBy: { createdAt: "asc" } }, kos: { select: { nama: true, slug: true } } } });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if (thread.memberId !== userId && thread.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(thread);
}

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.content) return NextResponse.json({ error: "content required" }, { status: 400 });
  const thread = await prisma.chatThread.findUnique({ where: { id: params.threadId } });
  if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  const userId = (session.user as any).id;
  if (thread.memberId !== userId && thread.ownerId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const message = await prisma.chatMessage.create({
    data: { threadId: params.threadId, senderId: userId, content: body.content },
  });
  await prisma.chatThread.update({ where: { id: params.threadId }, data: { updatedAt: new Date() } });
  return NextResponse.json(message);
}
