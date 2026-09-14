import { NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  const sb = createSupabaseService();
  const { data: user } = await sb.from("users").select("*").eq("email", email).maybeSingle();
  const expiry = (user as any)?.otpExpiry ? new Date((user as any).otpExpiry) : null;
  if (!user || (user as any).otpCode !== otp || (expiry && expiry < new Date())) {
    return NextResponse.json({ error: "OTP salah / kedaluwarsa" }, { status: 400 });
  }
  const { error } = await sb
    .from("users")
    .update({ isVerified: true, otpCode: null, otpExpiry: null, emailVerified: new Date().toISOString() } as any)
    .eq("email", email);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
