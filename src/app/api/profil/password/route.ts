import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const currentPassword = body.currentPassword || "";
  const newPassword = body.newPassword || "";
  const confirmPassword = body.confirmPassword || "";

  if (!currentPassword || !newPassword || !confirmPassword) return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
  if (newPassword.length < 6) return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
  if (newPassword !== confirmPassword) return NextResponse.json({ error: "Konfirmasi password tidak cocok" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) return NextResponse.json({ error: "Akun ini tidak pakai password (Google login?)" }, { status: 400 });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return NextResponse.json({ error: "Password lama salah bro" }, { status: 400 });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
  return NextResponse.json({ success: true, message: "Password berhasil diganti" });
}
