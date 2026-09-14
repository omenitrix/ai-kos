import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const targetId = params.id;
  if (targetId === (session.user as any).id) return NextResponse.json({ error: "Tidak bisa reset password diri sendiri di sini — pakai menu Profil" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const body = await req.json().catch(()=> ({}));
  const newPassword = (body.newPassword || "").toString();
  if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: targetId }, data: { passwordHash: hash } });
  try { await prisma.adminLog.create({ data: { adminId: (session.user as any).id, action: "RESET_PASSWORD", targetId, targetType: "User", keterangan: `reset by admin` } }); } catch {}
  return NextResponse.json({ success: true, message: `Password ${user.email} berhasil direset` });
}
