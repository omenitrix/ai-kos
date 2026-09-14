import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseService } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { email, otp, newPassword } = await req.json();
  const sb = createSupabaseService();
  const { data: user } = await sb.from("users").select("*").eq("email", email).maybeSingle();
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  if (otp && newPassword) {
    if ((user as any).otpCode !== otp) return NextResponse.json({ error: "OTP salah" }, { status: 400 });
    const { error } = await sb.from("users").update({ passwordHash: await bcrypt.hash(newPassword, 10), otpCode: null } as any).eq("email", email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }
  const otp2 = String(Math.floor(100000 + Math.random() * 900000));
  const { error } = await sb.from("users").update({ otpCode: otp2, otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString() } as any).eq("email", email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  console.log(`[MOCK EMAIL] OTP reset password untuk ${email}: ${otp2}`);
  return NextResponse.json({ success: true, otp: otp2 });
}
