import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list owners" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "";
  const supabase = createSupabaseService();
  let qb = supabase.from("users").select("id,name,username,email,phone,photo,isVerified,isSuspended,createdAt").eq("role", "OWNER").order("createdAt", { ascending: false }).limit(100);
  if (status === "verified") qb = qb.eq("isVerified", true);
  else if (status === "unverified") qb = qb.eq("isVerified", false);
  else if (status === "suspended") qb = qb.eq("isSuspended", true);
  else if (status === "active") qb = qb.eq("isSuspended", false);
  if (q) {
    const qq = q.replace(/%/g, "").replace(/,/g, "");
    qb = qb.or(`name.ilike.%${qq}%,email.ilike.%${qq}%,username.ilike.%${qq}%,phone.ilike.%${qq}%`);
  }
  const { data: owners, error } = await qb;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (owners || []).map((o: any) => o.id);
  let kosMap = new Map<string, number>();
  let aktifMap = new Map<string, number>();
  let pendingMap = new Map<string, number>();
  if (ids.length) {
    const { data: allKos } = await supabase.from("kos_listings").select("ownerId,status").in("ownerId", ids);
    for (const r of allKos || []) {
      const oid = (r as any).ownerId;
      kosMap.set(oid, (kosMap.get(oid) || 0) + 1);
      if ((r as any).status === "AKTIF") aktifMap.set(oid, (aktifMap.get(oid) || 0) + 1);
      if ((r as any).status === "PENDING_APPROVAL") pendingMap.set(oid, (pendingMap.get(oid) || 0) + 1);
    }
  }
  const enriched = (owners || []).map((o: any) => ({ ...o, kosCount: kosMap.get(o.id) || 0, kosAktif: aktifMap.get(o.id) || 0, kosPending: pendingMap.get(o.id) || 0 }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can perform this action" }, { status: 403 });
  const body = await req.json();
  if (!body.ownerId) return NextResponse.json({ error: "ownerId required" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: owner } = await supabase.from("users").select("id").eq("id", body.ownerId).maybeSingle();
  if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  const data: any = {};
  if (typeof body.isVerified === "boolean") data.isVerified = body.isVerified;
  if (typeof body.isSuspended === "boolean") data.isSuspended = body.isSuspended;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "No changes" }, { status: 400 });
  data.updatedAt = new Date().toISOString();
  const { data: updated, error } = await supabase.from("users").update(data).eq("id", body.ownerId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try { await supabase.from("admin_logs").insert({ adminId: (session.user as any).id, action: `UPDATE_OWNER:${Object.keys(data).join(",")}`, targetId: body.ownerId, targetType: "User", keterangan: JSON.stringify(data) }); } catch {}
  return NextResponse.json(updated);
}
