import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const user = await prisma.user.create({
      data: {
        username: data.username, email: data.email, phone: data.phone,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: data.role, otpCode: otp, otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });
    // Mock kirim email OTP (integrasi SMTP/pihak ketiga belum dikonfig)
    console.log(`[MOCK EMAIL] OTP untuk ${user.email}: ${otp}`);
    return NextResponse.json({ success: true, otp, userId: user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid data" }, { status: 400 });
  }
}
