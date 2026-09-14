import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id:true, name:true, username:true, email:true, phone:true, photo:true, role:true, isVerified:true, isSuspended:true, createdAt:true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name.trim() || null;
  if (typeof body.username === "string") {
    const u = body.username.trim();
    if (u) {
      if (u.length < 3) return NextResponse.json({ error: "Username minimal 3 karakter" }, { status: 400 });
      const exists = await prisma.user.findFirst({ where: { username: u, NOT: { id: userId } } });
      if (exists) return NextResponse.json({ error: "Username sudah dipakai" }, { status: 400 });
      data.username = u;
    } else data.username = null;
  }
  if (typeof body.phone === "string") data.phone = body.phone.trim() || null;
  if (typeof body.photo === "string") data.photo = body.photo.trim() || null;
  // email tidak bisa ganti sembarang — hanya jika belum verifikasi conflict check
  if (typeof body.email === "string") {
    const email = body.email.trim().toLowerCase();
    if (email && email !== (session.user as any).email) {
      const exists = await prisma.user.findUnique({ where: { email } });
      if (exists) return NextResponse.json({ error: "Email sudah dipakai" }, { status: 400 });
      data.email = email;
    }
  }
  const updated = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id:true, name:true, username:true, email:true, phone:true, photo:true, role:true, isVerified:true, createdAt:true },
  });
  return NextResponse.json(updated);
}
