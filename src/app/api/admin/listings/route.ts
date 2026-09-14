import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseService } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can list pending kos" }, { status: 403 });
  const supabase = createSupabaseService();
  const { data: kos, error } = await supabase.from("kos_listings").select("*").eq("status", "PENDING_APPROVAL").order("createdAt", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!kos || kos.length === 0) return NextResponse.json([]);
  const ownerIds = Array.from(new Set(kos.map((k: any) => k.ownerId)));
  const { data: owners } = await supabase.from("users").select("id,name,email").in("id", ownerIds);
  const ownerMap = new Map((owners || []).map((o: any) => [o.id, o]));
  const enriched = kos.map((k: any) => ({ ...k, owner: ownerMap.get(k.ownerId) || null }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session.user as any).role;
  if (role !== "ADMIN") return NextResponse.json({ error: "Only admin can perform this action" }, { status: 403 });
  const body = await req.json();
  if (!body.kosId) return NextResponse.json({ error: "kosId required" }, { status: 400 });
  const supabase = createSupabaseService();
  const { data: kos } = await supabase.from("kos_listings").select("id").eq("id", body.kosId).maybeSingle();
  if (!kos) return NextResponse.json({ error: "Kos not found" }, { status: 404 });
  const newStatus = body.status ?? "AKTIF";
  const { data: updated, error } = await supabase.from("kos_listings").update({ status: newStatus, updatedAt: new Date().toISOString() }).eq("id", body.kosId).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(updated);
}
