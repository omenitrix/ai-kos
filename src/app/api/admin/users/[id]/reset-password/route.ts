import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const targetId = params.id;
  if (targetId === (session.user as any).id) return NextResponse.json({ error: "Tidak bisa reset password diri sendiri di sini \u2014 pakai menu Profil" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: user } = await supabase.from("users").select("id,email").eq("id", targetId).maybeSingle();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const newPassword = (body.newPassword || "").toString();
  if (!newPassword || newPassword.length < 6) return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
  const hash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabase.from("users").update({ passwordHash: hash, updatedAt: new Date().toISOString() }).eq("id", targetId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try { await supabase.from("admin_logs").insert({ adminId: (session.user as any).id, action: "RESET_PASSWORD", targetId, targetType: "User", keterangan: "reset by admin" }); } catch {}
  return NextResponse.json({ success: true, message: `Password ${(user as any).email} berhasil direset` });
}
