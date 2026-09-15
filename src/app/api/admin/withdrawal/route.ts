import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET() {
  const s = await getSession();
  if (!s || (s.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const supa = createSupabaseService();
  const { data, error } = await supa.from("admin_logs").select("*, owner:users!admin_logs_adminId_fkey(id,name,email)").eq("targetType", "WITHDRAWAL").order("createdAt", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data || []).map((r: any) => {
    try { return { ...r, meta: JSON.parse(r.keterangan || "{}") }; } catch { return { ...r, meta: {} }; }
  }));
}

export async function PATCH(req: Request) {
  const s = await getSession();
  if (!s || (s.user as any).role !== "ADMIN") return NextResponse.json({ error: "Only admin" }, { status: 403 });
  const body = await req.json();
  if (!body.id || !["APPROVED", "REJECTED"].includes(body.status)) return NextResponse.json({ error: "id + status APPROVED/REJECTED required" }, { status: 400 });
  const supa = createSupabaseService();
  const { data: row } = await supa.from("admin_logs").select("*").eq("id", body.id).single();
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  let meta: any = {};
  try { meta = JSON.parse((row as any).keterangan || "{}"); } catch {}
  meta.status = body.status;
  meta.reviewedAt = new Date().toISOString();
  meta.reviewedBy = (s.user as any).id;
  meta.note = body.note || "";
  const { data, error } = await supa.from("admin_logs").update({ keterangan: JSON.stringify(meta), action: body.status === "APPROVED" ? "WITHDRAWAL_APPROVED" : "WITHDRAWAL_REJECTED" } as any).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
