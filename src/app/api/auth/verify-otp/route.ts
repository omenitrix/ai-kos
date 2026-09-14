import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.otpCode !== otp || (user.otpExpiry && user.otpExpiry < new Date())) {
    return NextResponse.json({ error: "OTP salah / kedaluwarsa" }, { status: 400 });
  }
  await prisma.user.update({ where: { email }, data: { isVerified: true, otpCode: null, otpExpiry: null, emailVerified: new Date() } });
  return NextResponse.json({ success: true });
}
