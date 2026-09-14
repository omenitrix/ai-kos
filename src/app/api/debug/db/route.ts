import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { email: true, role: true } });
    const kos = await prisma.kosListing.count();
    return NextResponse.json({ ok: true, users, kos, count: users.length, env: { hasDbUrl: !!process.env.DATABASE_URL, hasSecret: !!process.env.NEXTAUTH_SECRET, nextauthUrl: process.env.NEXTAUTH_URL || null } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, hasDbUrl: !!process.env.DATABASE_URL }, { status: 500 });
  }
}
