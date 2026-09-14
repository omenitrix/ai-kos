import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list users" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";
  const filterRole = searchParams.get("role") || "";
  const filterStatus = searchParams.get("status") || "";
  const supabase = createSupabaseService();

  let qb = supabase.from("users").select("id,name,username,email,phone,photo,role,isVerified,isSuspended,createdAt").order("createdAt", { ascending: false }).limit(100);
  if (filterRole) qb = qb.eq("role", filterRole);
  if (filterStatus === "suspended") qb = qb.eq("isSuspended", true);
  else if (filterStatus === "active") qb = qb.eq("isSuspended", false);
  else if (filterStatus === "verified") qb = qb.eq("isVerified", true);
  else if (filterStatus === "unverified") qb = qb.eq("isVerified", false);
  if (query) {
    const q = query.replace(/%/g, "").replace(/,/g, "");
    qb = qb.or(`name.ilike.%${q}%,email.ilike.%${q}%,username.ilike.%${q}%,phone.ilike.%${q}%`);
  }
  const { data: users, error } = await qb;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (users || []).map((u: any) => u.id);
  let kosMap = new Map<string, number>();
  let bookMap = new Map<string, number>();
  if (ids.length) {
    const { data: kosRows } = await supabase.from("kos_listings").select("ownerId").in("ownerId", ids);
    for (const r of kosRows || []) kosMap.set((r as any).ownerId, (kosMap.get((r as any).ownerId) || 0) + 1);
    const { data: bookRows } = await supabase.from("bookings").select("penyewaId").in("penyewaId", ids);
    for (const r of bookRows || []) bookMap.set((r as any).penyewaId, (bookMap.get((r as any).penyewaId) || 0) + 1);
  }
  const enriched = (users || []).map((u: any) => ({ ...u, kosCount: kosMap.get(u.id) || 0, bookingCount: bookMap.get(u.id) || 0 }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can perform this action" }, { status: 403 });
  const body = await req.json();
  if (!body.userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: user } = await supabase.from("users").select("id").eq("id", body.userId).maybeSingle();
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (body.userId === (session.user as any).id && body.isSuspended === true) return NextResponse.json({ error: "Tidak bisa suspend diri sendiri" }, { status: 400 });
  const data: any = {};
  if (typeof body.isSuspended === "boolean") data.isSuspended = body.isSuspended;
  if (typeof body.isVerified === "boolean") data.isVerified = body.isVerified;
  if (typeof body.role === "string" && ["GUEST","MEMBER","OWNER","ADMIN"].includes(body.role)) data.role = body.role;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "No changes" }, { status: 400 });
  data.updatedAt = new Date().toISOString();
  const { data: updated, error } = await supabase.from("users").update(data).eq("id", body.userId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try { await supabase.from("admin_logs").insert({ adminId: (session.user as any).id, action: `UPDATE_USER:${Object.keys(data).join(",")}`, targetId: body.userId, targetType: "User", keterangan: JSON.stringify(data) }); } catch {}
  return NextResponse.json(updated);
}
