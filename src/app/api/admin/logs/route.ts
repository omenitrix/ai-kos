import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can view logs" }, { status: 403 });
  const supabase = createSupabaseService();
  const { data: logs, error } = await supabase.from("admin_logs").select("*").order("createdAt", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!logs || logs.length === 0) return NextResponse.json([]);
  const adminIds = Array.from(new Set(logs.map((l: any) => l.adminId).filter(Boolean)));
  let adminMap = new Map<string, any>();
  if (adminIds.length) {
    const { data: admins } = await supabase.from("users").select("id,name,email").in("id", adminIds);
    adminMap = new Map((admins || []).map((a: any) => [a.id, a]));
  }
  const enriched = logs.map((l: any) => ({ ...l, admin: adminMap.get(l.adminId) || null }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can create log" }, { status: 403 });
  const body = await req.json();
  const supabase = createSupabaseService();
  const { data: log, error } = await supabase.from("admin_logs").insert({ adminId: (session.user as any).id, action: body.action || "MANUAL_LOG", targetId: body.targetId ?? null, targetType: body.targetType ?? null, keterangan: body.keterangan ?? null }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(log);
}
