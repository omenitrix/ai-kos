import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSupabaseService } from "@/lib/supabase/server";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const sb = createSupabaseService();

    const { data: exists } = await sb.from("users").select("id").eq("email", data.email).maybeSingle();
    if (exists) return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const { data: user, error } = await sb
      .from("users")
      .insert({
        username: data.username,
        email: data.email,
        phone: data.phone ?? null,
        passwordHash: await bcrypt.hash(data.password, 10),
        role: (data as any).role ?? "GUEST",
        otpCode: otp,
        otpExpiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      })
      .select("id,email")
      .single();
    if (error) throw new Error(error.message);

    console.log(`[MOCK EMAIL] OTP untuk ${user.email}: ${otp}`);
    return NextResponse.json({ success: true, otp, userId: user.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Invalid data" }, { status: 400 });
  }
}
