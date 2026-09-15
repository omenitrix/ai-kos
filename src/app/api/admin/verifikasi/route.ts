import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const s = await getSession();
  if (!s || (s.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const supa = createSupabaseService();
  const { data, error } = await supa.from("verifications").select("*, user:users!verifications_userId_fkey(id,name,email,phone,photo)").order("createdAt", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s || (s.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const body = await req.json();
  if (!body.id || !["APPROVED", "REJECTED"].includes(body.status)) return NextResponse.json({ error: "id + status APPROVED/REJECTED required" }, { status: 400 });
  const supa = createSupabaseService();
  const { data, error } = await supa.from("verifications").update({
    status: body.status,
    nota: body.nota || null,
    reviewedAt: new Date().toISOString(),
  }).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // optional: mark user isVerified when APPROVED
  if (body.status === "APPROVED" && data) {
    await supa.from("users").update({ isVerified: true } as any).eq("id", (data as any).userId);
  }
  return NextResponse.json(data);
}
