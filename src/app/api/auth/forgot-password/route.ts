import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, otp, newPassword } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  if (otp && newPassword) {
    if (user.otpCode !== otp) return NextResponse.json({ error: "OTP salah" }, { status: 400 });
    await prisma.user.update({ where: { email }, data: { passwordHash: await bcrypt.hash(newPassword, 10), otpCode: null } });
    return NextResponse.json({ success: true });
  }
  const otp2 = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.user.update({ where: { email }, data: { otpCode: otp2, otpExpiry: new Date(Date.now() + 10 * 60 * 1000) } });
  console.log(`[MOCK EMAIL] OTP reset password untuk ${email}: ${otp2}`);
  return NextResponse.json({ success: true, otp: otp2 });
}
